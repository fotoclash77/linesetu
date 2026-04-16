import { Router } from "express";
import Razorpay from "razorpay";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  query, where, orderBy, writeBatch, runTransaction,
  arrayUnion, arrayRemove, increment, deleteField,
  queueDocId, todayDate, withRetry,
} from "../lib/firebase.js";
import { emitDoctorTokenChange, tokenEmitter } from "../lib/tokenEmitter.js";
import { sendQueueReminders } from "../lib/queueReminders.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface RefundContext {
  paymentId: string;
  orderId: string;
  patientId?: string;
  doctorId: string;
  date: string;
  shift: string;
}

// issueRefund persists a server-side record in Firestore before and after the refund.
// The Firestore doc (failedBookings/{paymentId}) ties this refund to an actual
// capacity-full booking failure, prevents double-refunds, and provides an audit trail.
// Only one refund per paymentId can ever be issued through this path.
async function issueRefund(ctx: RefundContext): Promise<{ refundId: string | null; ok: boolean }> {
  const { paymentId, orderId } = ctx;
  try {
    const recordRef  = doc(db, Collections.FAILED_BOOKINGS, paymentId);
    const recordSnap = await getDoc(recordRef);

    // Idempotency: if already refunded, return the stored result
    if (recordSnap.exists()) {
      const rec = recordSnap.data() as any;
      if (rec.status === "refunded" && rec.refundId) {
        console.log(`[Tokens] Refund already issued for ${paymentId}: ${rec.refundId}`);
        return { refundId: rec.refundId, ok: true };
      }
      // If orderId doesn't match, block — this paymentId belongs to a different booking
      if (rec.orderId && rec.orderId !== orderId) {
        console.error(`[Tokens] Refund blocked: orderId mismatch for ${paymentId}`);
        return { refundId: null, ok: false };
      }
    }

    // Verify ownership via Razorpay before touching money
    const payment = await razorpay.payments.fetch(paymentId);
    const pmtData  = payment as any;
    if (pmtData.order_id !== orderId) {
      console.error(`[Tokens] Refund blocked: Razorpay order mismatch for ${paymentId}`);
      return { refundId: null, ok: false };
    }
    if (pmtData.status !== "captured") {
      console.error(`[Tokens] Refund blocked: payment not captured (status=${pmtData.status})`);
      return { refundId: null, ok: false };
    }

    // Write a "pending" record to claim this refund slot atomically
    await setDoc(recordRef, {
      ...ctx, status: "pending", createdAt: Timestamp.now(),
    }, { merge: true });

    const refund = await razorpay.payments.refund(paymentId, {} as Parameters<typeof razorpay.payments.refund>[1]);
    console.log(`[Tokens] Auto-refund issued: refundId=${refund.id} paymentId=${paymentId}`);

    // Mark as completed — no further refunds can be issued for this paymentId
    await setDoc(recordRef, { status: "refunded", refundId: refund.id, refundedAt: Timestamp.now() }, { merge: true });
    return { refundId: refund.id, ok: true };
  } catch (e: any) {
    console.error(`[Tokens] Auto-refund failed for paymentId=${paymentId}:`, e?.message);
    return { refundId: null, ok: false };
  }
}

const RESERVATION_TTL_MS = 5 * 60 * 1000;
const router = Router();

function formatTokenLabel(tokenNumber: number, type?: string) {
  return type === "emergency" ? `#E${tokenNumber}` : `#${tokenNumber}`;
}

export function countActiveReservations(pending: Record<string, { expiresAt: any }>, excludePatientId?: string): number {
  const now = Date.now();
  return Object.entries(pending).filter(([pid, r]) => {
    if (excludePatientId && pid === excludePatientId) return false;
    const ms = typeof r.expiresAt?.toMillis === "function" ? r.expiresAt.toMillis() : Number(r.expiresAt);
    return ms > now;
  }).length;
}

// Helper: check if a patient already has an active (waiting/in_consult) token for a slot
async function hasDuplicateActiveToken(
  patientId: string, doctorId: string, tokenDate: string, shift: string, forMemberId: string,
): Promise<boolean> {
  const snap = await withRetry(() => getDocs(query(
    collection(db, Collections.TOKENS),
    where("patientId", "==", patientId),
    where("doctorId", "==", doctorId),
  )));
  return snap.docs.some(d => {
    const tok = d.data() as any;
    if (tok.date !== tokenDate || tok.shift !== shift) return false;
    const status = tok.status as string;
    if (status !== "waiting" && status !== "in_consult") return false;
    const tokMember = tok.forMemberId ?? "self";
    return tokMember === forMemberId;
  });
}

// POST /api/tokens/reserve — Firestore-atomic soft-lock with pre-assigned token number (FCFS guaranteed)
// Increments nextTokenNumber at reserve time so the patient's position is deterministic.
router.post("/tokens/reserve", async (req, res) => {
  const { doctorId, patientId, date, shift = "morning", forMemberId = "self" } = req.body;
  if (!doctorId || !patientId) {
    return res.status(400).json({ error: "doctorId and patientId are required" });
  }

  const tokenDate  = date || todayDate();

  // Duplicate check — must be before the queue transaction (transactions can't do collection queries).
  // Fail closed: if the check itself errors, return 503 rather than letting a duplicate slip through.
  try {
    const isDuplicate = await hasDuplicateActiveToken(patientId, doctorId, tokenDate, shift, forMemberId);
    if (isDuplicate) {
      return res.status(409).json({ reserved: false, duplicateBooking: true, error: "Already booked for this slot" });
    }
  } catch (err) {
    return res.status(503).json({ reserved: false, error: "Duplicate check failed. Please try again." });
  }

  const queueId    = queueDocId(doctorId, tokenDate, shift);
  const queueRef   = doc(db, Collections.QUEUES, queueId);
  const doctorRef  = doc(db, Collections.DOCTORS, doctorId);
  const doctorSnap = await getDoc(doctorRef);
  const doctorData = doctorSnap.exists() ? doctorSnap.data() as any : null;
  const shiftCfg   = doctorData?.calendar?.[tokenDate]?.[shift];
  const maxTokens  = shiftCfg?.maxTokens ? parseInt(String(shiftCfg.maxTokens), 10) : null;

  try {
    let reservedResponse: any = null;

    await runTransaction(db, async (txn) => {
      const queueSnap = await txn.get(queueRef);
      const queueData = queueSnap.exists() ? queueSnap.data() : {} as any;
      const pending   = (queueData.pendingReservations ?? {}) as Record<string, { expiresAt: any; tokenNumber?: number }>;
      const now       = Date.now();
      const nowTs     = Timestamp.now();

      // If a valid unexpired reservation already exists, return it unchanged (idempotent)
      const existing = pending[patientId];
      const existingExpiresMs = existing
        ? (typeof existing.expiresAt?.toMillis === "function" ? existing.expiresAt.toMillis() : Number(existing.expiresAt))
        : 0;

      if (existing && existingExpiresMs > now) {
        reservedResponse = {
          reserved: true,
          tokenNumber: existing.tokenNumber ?? 0,
          expiresAt: existingExpiresMs,
          ttlMs: existingExpiresMs - now,
        };
        return; // No queue mutation needed — reservation still active
      }

      // Capacity check: effectiveBooked = committed (totalBooked) + other active reservations
      const totalBooked     = (queueData.totalBooked as number) ?? 0;
      const activeCount     = countActiveReservations(pending, patientId); // exclude own (expired) entry
      const effectiveBooked = totalBooked + activeCount;

      if (maxTokens !== null && effectiveBooked >= maxTokens) {
        throw new Error("CAPACITY_FULL");
      }

      // Pre-assign a deterministic token number by consuming the next slot on the monotonic counter
      const lastAssigned    = (queueData.nextTokenNumber as number) ?? 0;
      const assignedToken   = lastAssigned + 1;
      const expiresAt       = Timestamp.fromMillis(now + RESERVATION_TTL_MS);

      const reservationEntry = { expiresAt, createdAt: nowTs, tokenNumber: assignedToken };

      if (queueSnap.exists()) {
        txn.update(queueRef, {
          [`pendingReservations.${patientId}`]: reservationEntry,
          nextTokenNumber: assignedToken, // Monotonic counter advanced at reservation time
          updatedAt: nowTs,
        });
      } else {
        txn.set(queueRef, {
          doctorId, date: tokenDate, shift,
          isActive: false,
          currentToken: 0,
          nextTokenNumber: assignedToken,
          totalBooked: 0,
          doneCount: 0,
          waitingTokenIds: [],
          waitingTokenNumbers: [],
          pendingReservations: { [patientId]: reservationEntry },
          updatedAt: nowTs,
        });
      }

      reservedResponse = {
        reserved: true,
        tokenNumber: assignedToken,
        expiresAt: now + RESERVATION_TTL_MS,
        ttlMs: RESERVATION_TTL_MS,
      };
    });

    emitDoctorTokenChange(doctorId);
    res.json(reservedResponse);
  } catch (err: any) {
    if (err.message === "CAPACITY_FULL") {
      return res.status(409).json({ reserved: false, capacityFull: true, error: "No slots available" });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tokens — atomic token booking with capacity check + reservation consumption
router.post("/tokens", async (req, res) => {
  const paymentId: string | undefined = req.body.paymentId;
  try {
    const {
      doctorId, patientId, patientName, patientPhone,
      type = "normal", date, shift = "morning",
      source = "online",
      forMemberId = "self",
      age, gender, address, area, notes,
      visitType = "first-visit",
      expectedTokenNumber,
      orderId,
    } = req.body;

    if (!doctorId || !patientName) {
      return res.status(400).json({ error: "doctorId and patientName are required" });
    }

    // Duplicate check for online bookings with a known patientId
    if (patientId && source !== "walkin") {
      const tokenDate = date || todayDate();
      const isDuplicate = await hasDuplicateActiveToken(patientId, doctorId, tokenDate, shift, forMemberId);
      if (isDuplicate) {
        return res.status(409).json({ duplicateBooking: true, error: "Already booked for this slot" });
      }
    }

    // For online bookings, enrich token with patient profile data (age, gender, etc.)
    // if the caller did not supply them in the body.
    let resolvedAge     = age     ?? null;
    let resolvedGender  = gender  ?? null;
    let resolvedAddress = address ?? null;
    let resolvedArea    = area    ?? null;
    if (patientId && (!resolvedAge || !resolvedGender)) {
      try {
        const patientSnap = await getDoc(doc(db, Collections.PATIENTS, patientId));
        if (patientSnap.exists()) {
          const pd = patientSnap.data() as any;
          if (!resolvedAge)     resolvedAge     = pd.age     ?? null;
          if (!resolvedGender)  resolvedGender  = pd.gender  ?? null;
          if (!resolvedAddress) resolvedAddress = pd.address ?? null;
          if (!resolvedArea)    resolvedArea    = pd.area    ?? null;
        }
      } catch { /* non-fatal — token still books without demographics */ }
    }

    const tokenDate    = date || todayDate();
    const queueId      = queueDocId(doctorId, tokenDate, shift);
    const queueRef     = doc(db, Collections.QUEUES, queueId);
    const tokenRef     = doc(collection(db, Collections.TOKENS));
    const doctorRef    = doc(db, Collections.DOCTORS, doctorId);
    const counterRef   = doc(db, Collections.META, "counters");
    const doctorSnap = await getDoc(doctorRef);
    const doctorData = doctorSnap.exists() ? doctorSnap.data() as any : null;
    const shiftCfg   = doctorData?.calendar?.[tokenDate]?.[shift];
    const maxTokens  = shiftCfg?.maxTokens ? parseInt(String(shiftCfg.maxTokens), 10) : null;

    // Walk-in/offline tokens: no online payment, no platform fee, no doctor online earnings
    const PLATFORM_FEE = 10;
    const isWalkinSource  = source === "walkin";
    const isEmergencyType = type === "emergency";
    // Use the doctor's actual configured fee (fall back to platform defaults only when unset/NaN)
    const parsedEmergencyFee = Number(doctorData?.emergencyFee);
    const parsedConsultFee   = Number(doctorData?.consultFee);
    const rawDoctorFee = isWalkinSource ? 0
      : isEmergencyType
        ? (isNaN(parsedEmergencyFee) ? 20 : parsedEmergencyFee)
        : (isNaN(parsedConsultFee)   ? 10 : parsedConsultFee);
    const doctorEarns = rawDoctorFee;
    const platformFee = isWalkinSource ? 0 : PLATFORM_FEE;
    const patientPaid = isWalkinSource ? 0 : doctorEarns + platformFee;

    const parsedClinicConsultFee = Number(isEmergencyType ? doctorData?.clinicEmergencyFee : doctorData?.clinicConsultFee);
    const clinicConsultFee = isNaN(parsedClinicConsultFee) ? 0 : parsedClinicConsultFee;
    const parsedWalkinFee = Number(doctorData?.walkinFee);
    const walkinFee = isNaN(parsedWalkinFee) ? 0 : parsedWalkinFee;
    const payAtClinic = clinicConsultFee + walkinFee;
    const totalVisitCost = patientPaid + payAtClinic;

    let resultTokenData: any = null;
    let autoAdjusted = false;

    await runTransaction(db, async (txn) => {
      const queueSnap   = await txn.get(queueRef);
      const counterSnap = await txn.get(counterRef);
      const queueData   = queueSnap.exists() ? queueSnap.data() : {} as any;
      const nextSerial  = ((counterSnap.exists() ? counterSnap.data()?.bookingSerial : 0) ?? 0) + 1;
      const pending     = (queueData.pendingReservations ?? {}) as Record<string, { expiresAt: any; tokenNumber?: number }>;

      const currentBooked   = (queueData.totalBooked as number) ?? 0;
      const currentNextToken = (queueData.nextTokenNumber as number) ?? 0;
      const nowMs           = Date.now();

      // Validate reservation freshness — expired entries do NOT grant soft-lock privilege
      const rawReservation   = pending[patientId];
      const reservationExpMs = rawReservation
        ? (typeof rawReservation.expiresAt?.toMillis === "function"
            ? rawReservation.expiresAt.toMillis()
            : Number(rawReservation.expiresAt))
        : 0;
      const hasValidReservation = !!rawReservation && reservationExpMs > nowMs;

      // Active reservations from OTHER patients (fresh only) count against capacity
      const otherActiveCount = countActiveReservations(pending, patientId);
      const effectiveBooked  = currentBooked + otherActiveCount;

      // Patients with a valid reservation: only committed bookings count (their slot is held)
      // Patients without reservation: compete against full effectiveBooked
      if (maxTokens !== null && hasValidReservation && currentBooked >= maxTokens) {
        throw new Error("CAPACITY_FULL");
      }
      if (maxTokens !== null && !hasValidReservation && effectiveBooked >= maxTokens) {
        throw new Error("CAPACITY_FULL");
      }

      let nextTokenNumber: number;
      let queueTokenUpdate: Record<string, any> = {};

      if (hasValidReservation && rawReservation.tokenNumber) {
        // FCFS: use the token number pre-assigned at reservation time
        // nextTokenNumber counter was already incremented when reservation was created
        nextTokenNumber = rawReservation.tokenNumber;
        // No increment to nextTokenNumber — already done at reserve time
      } else {
        // Walk-in / no valid reservation: assign the next sequential token
        nextTokenNumber = currentNextToken + 1;
        queueTokenUpdate.nextTokenNumber = nextTokenNumber;
      }

      if (expectedTokenNumber !== undefined && expectedTokenNumber !== null && nextTokenNumber !== Number(expectedTokenNumber)) {
        autoAdjusted = true;
      }

      const nowTs = Timestamp.now();
      const tokenData = {
        tokenNumber: nextTokenNumber,
        bookingSerial: nextSerial,
        doctorId, patientId: patientId || null, patientName,
        patientPhone: patientPhone || "",
        type, source, status: "waiting",
        forMemberId: forMemberId || "self",
        date: tokenDate, shift,
        patientPaid, doctorEarns, platformFee,
        clinicConsultFee, walkinFee, payAtClinic, totalVisitCost,
        paymentId: paymentId || "",
        paymentStatus: paymentId ? "paid" : "pending",
        bookedAt: nowTs,
        calledAt: null, doneAt: null,
        age: resolvedAge, gender: resolvedGender,
        address: resolvedAddress, area: resolvedArea,
        notes: notes || null,
        visitType: visitType || "first-visit",
      };

      txn.set(tokenRef, tokenData);
      txn.set(counterRef, { bookingSerial: nextSerial }, { merge: true });

      const queueUpdate: Record<string, any> = {
        ...queueTokenUpdate, // includes nextTokenNumber only for non-reserved bookings
        totalBooked: increment(1),
        waitingTokenIds: arrayUnion(tokenRef.id),
        waitingTokenNumbers: arrayUnion(nextTokenNumber),
        updatedAt: nowTs,
      };
      // Remove reservation entry (valid or stale) atomically during booking
      if (patientId && rawReservation) {
        queueUpdate[`pendingReservations.${patientId}`] = deleteField();
      }

      if (queueSnap.exists()) {
        txn.update(queueRef, queueUpdate);
      } else {
        txn.set(queueRef, {
          doctorId, date: tokenDate, shift,
          isActive: true,
          currentToken: 0,
          nextTokenNumber,
          totalBooked: 1,
          doneCount: 0,
          waitingTokenIds: [tokenRef.id],
          waitingTokenNumbers: [nextTokenNumber],
          pendingReservations: {},
          updatedAt: nowTs,
        });
      }

      resultTokenData = tokenData;
    });

    emitDoctorTokenChange(doctorId);

    const nextTokenNumber = resultTokenData.tokenNumber;
    const nextTokenLabel = formatTokenLabel(nextTokenNumber, resultTokenData.type);

    // Create transaction record for online paid bookings (not walk-in).
    // Uses tokenRef.id as the document ID → idempotent (retries overwrite, no duplicates).
    if (!isWalkinSource && paymentId && resultTokenData) {
      const txRef       = doc(db, Collections.TRANSACTIONS, tokenRef.id);
      const earningsRef = doc(db, Collections.DOCTORS, doctorId, "earnings", tokenDate);
      try {
        await setDoc(txRef, {
          doctorId,
          patientId:    patientId || null,
          patientName,
          tokenId:      tokenRef.id,
          tokenNumber:  nextTokenNumber,
          tokenType:    type,          // "normal" | "emergency"
          amount:       doctorEarns,   // net doctor earning (actual fee)
          platformFee,                 // always ₹10 for online tokens
          patientPaid,                 // doctorEarns + platformFee
          type:         "earning",
          status:       "earned",      // pending completion; becomes "completed" on done
          source:       "online",
          shift,
          date:         tokenDate,
          paymentId:    paymentId || "",
          paymentStatus: "paid",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } catch (e: any) {
        console.error(`[Tokens] Transaction write failed tokenId=${tokenRef.id}:`, e?.message);
      }

      // Credit doctor's balance + daily aggregate immediately after verified payment + token creation.
      // This replaces the old behaviour (credit only at done) so earnings appear at once.
      if (doctorEarns > 0) {
        try {
          const earningsSnap = await getDoc(earningsRef);
          const isE          = isEmergencyType;
          const earnBatch    = writeBatch(db);
          earnBatch.update(doctorRef, { pendingPayout: increment(doctorEarns) });
          if (earningsSnap.exists()) {
            earnBatch.update(earningsRef, {
              totalTokens:     increment(1),
              tokensNormal:    increment(isE ? 0 : 1),
              tokensEmergency: increment(isE ? 1 : 0),
              earned:          increment(doctorEarns),
            });
          } else {
            earnBatch.set(earningsRef, {
              date: tokenDate, totalTokens: 1,
              tokensNormal: isE ? 0 : 1, tokensEmergency: isE ? 1 : 0,
              earned: doctorEarns, shift,
            });
          }
          await earnBatch.commit();
        } catch (e: any) {
          console.error(`[Tokens] Earnings credit failed tokenId=${tokenRef.id} doctorId=${doctorId}:`, e?.message);
        }
      }
    }

    if (!isWalkinSource) {
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          doctorId, type: "token_booked",
          title: "New E-Token Booked",
          body: `${patientName} booked Token ${nextTokenLabel} for ${tokenDate} (${shift} shift).`,
          tokenId: tokenRef.id, tokenNumber: nextTokenNumber,
          patientName, read: false, createdAt: Timestamp.now(),
        });
      } catch (_) {}
    }

    if (patientId && source !== "walkin") {
      const drName = doctorData?.name ? `Dr. ${doctorData.name}` : "your doctor";
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          patientId, type: "token_confirmed",
          title: "Booking Confirmed!",
          body: `Your Token ${nextTokenLabel} with ${drName} has been booked for ${tokenDate} (${shift} shift).`,
          tokenId: tokenRef.id, tokenNumber: nextTokenNumber,
          read: false, createdAt: Timestamp.now(),
        });
      } catch (_) {}
    }

    const response: any = { id: tokenRef.id, ...resultTokenData };
    response.message = autoAdjusted
      ? `Selected token unavailable. Assigned next available token: ${nextTokenNumber}.`
      : `Token booked successfully. Your token number is ${nextTokenNumber}.`;
    if (autoAdjusted) response.autoAdjusted = true;

    res.status(201).json(response);
  } catch (err: any) {
    if (err.message === "CAPACITY_FULL") {
      let refundInitiated = false;
      let refundId: string | null = null;
      const { orderId, doctorId, patientId, date, shift = "morning" } = req.body;
      if (paymentId && orderId && doctorId) {
        const result = await issueRefund({
          paymentId, orderId,
          patientId: patientId ?? undefined,
          doctorId,
          date: date ?? "",
          shift: shift ?? "morning",
        });
        refundInitiated = result.ok;
        refundId = result.refundId;
      }
      return res.status(409).json({
        capacityFull: true,
        refundInitiated,
        refundId,
        error: "Booking failed: Slots are full.",
        message: refundInitiated
          ? "Slots are full. Your payment has been refunded automatically."
          : "Slots are full. Please contact support for a refund.",
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens
router.get("/tokens", async (req, res) => {
  try {
    const { doctorId, patientId, date, status, from, to } = req.query as Record<string, string>;
    const constraints: any[] = [];
    if (doctorId)  constraints.push(where("doctorId", "==", doctorId));
    if (patientId) constraints.push(where("patientId", "==", patientId));
    if (status)    constraints.push(where("status", "==", status));
    const isISODate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (isISODate) {
      constraints.push(where("date", "==", date));
    } else if (from || to) {
      if (from) constraints.push(where("date", ">=", from));
      if (to)   constraints.push(where("date", "<=", to));
    }
    const snap = await withRetry(() => getDocs(query(collection(db, Collections.TOKENS), ...constraints)));
    let tokens = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (date && !isISODate) {
      const dayNum = parseInt(date, 10);
      tokens = tokens.filter((t: any) => parseInt(String(t.date ?? ""), 10) === dayNum);
    }
    tokens = tokens.sort((a: any, b: any) => (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0));
    res.json({ tokens });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens/visit-count — must be before :tokenId
router.get("/tokens/visit-count", async (req, res) => {
  try {
    const doctorId  = req.query.doctorId as string;
    const phone     = req.query.phone as string;
    const excludeId = req.query.excludeId as string | undefined;
    if (!doctorId || !phone) return res.status(400).json({ error: "doctorId and phone required" });
    const snap = await withRetry(() => getDocs(
      query(collection(db, Collections.TOKENS),
        where("doctorId", "==", doctorId),
        where("patientPhone", "==", phone),
      ),
    ));
    const count = snap.docs.filter(d => {
      if (excludeId && d.id === excludeId) return false;
      return d.data().status === "done";
    }).length;
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens/:tokenId
router.get("/tokens/:tokenId", async (req, res) => {
  try {
    const snap = await getDoc(doc(db, Collections.TOKENS, req.params.tokenId));
    if (!snap.exists()) return res.status(404).json({ error: "Token not found" });
    res.json({ id: snap.id, ...snap.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/call
router.patch("/tokens/:tokenId/call", async (req, res) => {
  try {
    const tokenRef  = doc(db, Collections.TOKENS, req.params.tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token    = tokenSnap.data();

    if (token.status === "cancelled" || token.paymentStatus === "refunded") {
      return res.status(409).json({ error: "Cannot call a cancelled or refunded token" });
    }

    const queueRef = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));

    // Read current waitingTokenNumbers before updating so we can derive the new list
    const queueSnap = await getDoc(queueRef);
    const prevWaiting: number[] = (queueSnap.exists() ? (queueSnap.data() as any).waitingTokenNumbers : null) ?? [];
    const newWaiting = prevWaiting.filter((n: number) => n !== token.tokenNumber);

    const batch = writeBatch(db);
    batch.update(tokenRef, { status: "in_consult", calledAt: Timestamp.now() });
    batch.update(queueRef, {
      currentToken: token.tokenNumber,
      currentTokenType: token.status === "skipped" ? "skipped" : (token.type || "normal"),
      waitingTokenIds: arrayRemove(req.params.tokenId),
      waitingTokenNumbers: arrayRemove(token.tokenNumber),
      updatedAt: Timestamp.now(),
    });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);
    res.json({ id: req.params.tokenId, status: "in_consult" });

    // Send push reminders to waiting patients (fire-and-forget)
    sendQueueReminders(token.doctorId, token.date, token.shift, newWaiting).catch(() => {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/done  — mark token consulted only.
// Calling the next patient is always done via PATCH /tokens/:id/call (Send Next button).
router.patch("/tokens/:tokenId/done", async (req, res) => {
  try {
    const tokenRef  = doc(db, Collections.TOKENS, req.params.tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token    = tokenSnap.data();

    if (token.status === "cancelled" || token.paymentStatus === "refunded") {
      return res.status(409).json({ error: "Cannot mark a cancelled or refunded token as done" });
    }

    const queueRef = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const txRef    = doc(db, Collections.TRANSACTIONS, req.params.tokenId);

    // Earnings are credited at booking time (POST /api/tokens).
    // done-route only marks the token/transaction complete — no balance change here.
    const isOnlineToken = token.source !== "walkin" && (token.patientPaid ?? 0) > 0;

    // Guard: only update tx if it exists (legacy records or rare POST-path failure may lack it)
    const txSnap = isOnlineToken ? await getDoc(txRef) : null;

    const batch = writeBatch(db);

    batch.update(tokenRef, { status: "done", doneAt: Timestamp.now() });
    batch.update(queueRef, { doneCount: increment(1), updatedAt: Timestamp.now() });

    // Mark transaction as "completed" so the Earnings tab shows the correct status badge.
    if (isOnlineToken && txSnap?.exists()) {
      batch.update(txRef, { status: "completed", updatedAt: Timestamp.now() });
    }

    await batch.commit();
    emitDoctorTokenChange(token.doctorId);

    res.json({ id: req.params.tokenId, status: "done" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/upnext
router.patch("/tokens/:tokenId/upnext", async (req, res) => {
  try {
    const tokenRef  = doc(db, Collections.TOKENS, req.params.tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token = tokenSnap.data();

    if (token.status === "cancelled" || token.paymentStatus === "refunded") {
      return res.status(409).json({ error: "Cannot set a cancelled or refunded token as up next" });
    }

    const existingQ = query(
      collection(db, Collections.TOKENS),
      where("doctorId", "==", token.doctorId),
      where("date",     "==", token.date),
      where("shift",    "==", token.shift),
      where("status",   "==", "up_next"),
    );
    const existingSnap = await withRetry(() => getDocs(existingQ));
    const batch = writeBatch(db);
    existingSnap.docs.forEach(d => {
      if (d.id !== req.params.tokenId) batch.update(d.ref, { status: "waiting" });
    });
    batch.update(tokenRef, { status: "up_next" });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);
    res.json({ id: req.params.tokenId, status: "up_next" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/skip
router.patch("/tokens/:tokenId/skip", async (req, res) => {
  try {
    const tokenRef  = doc(db, Collections.TOKENS, req.params.tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token    = tokenSnap.data();

    if (token.status === "cancelled" || token.paymentStatus === "refunded") {
      return res.status(409).json({ error: "Cannot skip a cancelled or refunded token" });
    }

    const queueRef = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const batch = writeBatch(db);
    batch.update(tokenRef, { status: "skipped", skippedAt: Timestamp.now() });
    batch.update(queueRef, { waitingTokenIds: arrayRemove(req.params.tokenId), waitingTokenNumbers: arrayRemove(token.tokenNumber), updatedAt: Timestamp.now() });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);
    res.json({ id: req.params.tokenId, status: "skipped" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/refund — doctor-initiated refund for a skipped online token
router.patch("/tokens/:tokenId/refund", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const tokenRef  = doc(db, Collections.TOKENS, tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token = tokenSnap.data();

    if (token.source === "walkin") {
      return res.status(400).json({ error: "Walk-in tokens cannot be refunded online" });
    }
    const refundableStatuses = ["skipped", "waiting"];
    if (!refundableStatuses.includes(token.status)) {
      return res.status(400).json({ error: "Only waiting or skipped tokens can be cancelled and refunded" });
    }
    // Idempotent — already refunded
    if (token.paymentStatus === "refunded") {
      return res.json({ id: tokenId, alreadyRefunded: true, message: "Already refunded" });
    }
    if (!token.paymentId) {
      return res.status(400).json({ error: "No online payment found for this token" });
    }

    // Issue Razorpay refund (bypass for test-mode payments)
    let refundId: string | null = null;
    const isTestPayment = token.paymentId.startsWith("test_pay_") &&
      process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_");
    if (isTestPayment) {
      refundId = `test_rfnd_${Date.now()}`;
      console.log(`[Tokens] TEST-MODE doctor refund (bypassed): refundId=${refundId} tokenId=${tokenId}`);
    } else {
      try {
        const refund = await razorpay.payments.refund(token.paymentId, {} as Parameters<typeof razorpay.payments.refund>[1]);
        refundId = refund.id;
        console.log(`[Tokens] Doctor refund issued: refundId=${refundId} tokenId=${tokenId}`);
      } catch (e: any) {
        console.error(`[Tokens] Doctor refund failed for tokenId=${tokenId}:`, e?.message);
        return res.status(502).json({ error: "Refund via payment gateway failed. Please try again." });
      }
    }

    // Transaction document uses tokenId as doc ID (idempotent writes at booking).
    const txRef       = doc(db, Collections.TRANSACTIONS, tokenId);
    const doctorRef   = doc(db, Collections.DOCTORS, token.doctorId);
    const earningsRef = doc(db, Collections.DOCTORS, token.doctorId, "earnings", token.date);
    const [txSnap, earningsSnap, doctorSnapR] = await Promise.all([
      getDoc(txRef),
      getDoc(earningsRef),
      getDoc(doctorRef),
    ]);
    const storedEarns    = txSnap.exists() ? (txSnap.data()?.amount ?? 0) : 0;
    const isE            = token.type === "emergency";
    const refundDrName   = doctorSnapR.exists() ? `Dr. ${(doctorSnapR.data() as any)?.name ?? ""}`.trim() : "your doctor";

    // Update token + transaction + reverse earnings in one batch
    const batch = writeBatch(db);
    batch.update(tokenRef, {
      status: "cancelled",
      paymentStatus: "refunded",
      refundId: refundId ?? "",
      refundedAt: Timestamp.now(),
    });

    // If the token was still in the waiting queue, remove it
    if (token.status === "waiting") {
      const queueRef = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
      batch.update(queueRef, {
        waitingTokenIds:     arrayRemove(tokenId),
        waitingTokenNumbers: arrayRemove(token.tokenNumber),
        updatedAt:           Timestamp.now(),
      });
    }
    if (txSnap.exists()) {
      batch.update(txRef, {
        type:          "refund",
        status:        "refunded",
        refundId:      refundId ?? "",
        paymentStatus: "refunded",
        updatedAt:     Timestamp.now(),
      });
    }
    // Reverse the earnings credited at booking time
    if (storedEarns > 0) {
      batch.update(doctorRef, { pendingPayout: increment(-storedEarns) });
      if (earningsSnap.exists()) {
        batch.update(earningsRef, {
          totalTokens:     increment(-1),
          tokensNormal:    increment(isE ? 0 : -1),
          tokensEmergency: increment(isE ? -1 : 0),
          earned:          increment(-storedEarns),
        });
      }
    }
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);

    // Notify the patient in real-time
    if (token.patientId) {
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          patientId: token.patientId,
          type: "token_refunded",
          title: "Token Cancelled & Refunded",
          body: `Your Token ${formatTokenLabel(token.tokenNumber, token.type)} with ${refundDrName} has been cancelled. Your payment has been refunded and will reflect within 5-7 business days.`,
          tokenId,
          tokenNumber: token.tokenNumber,
          read: false,
          createdAt: Timestamp.now(),
        });
      } catch (_) {}
    }

    res.json({ id: tokenId, refunded: true, refundId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/cancel
router.patch("/tokens/:tokenId/cancel", async (req, res) => {
  try {
    const tokenId   = req.params.tokenId;
    const tokenRef  = doc(db, Collections.TOKENS, tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token       = tokenSnap.data();

    // Idempotency guard — already cancelled, nothing to reverse again
    if (token.status === "cancelled" || token.paymentStatus === "refunded") {
      return res.json({ id: tokenId, status: "cancelled", idempotent: true });
    }

    const queueRef    = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const isOnlineToken = token.source !== "walkin" && (token.patientPaid ?? 0) > 0;

    // Read transaction + earnings + doctor docs before batch (needed for conditional reversal + name)
    const txRef       = doc(db, Collections.TRANSACTIONS, tokenId);
    const doctorRef   = doc(db, Collections.DOCTORS, token.doctorId);
    const earningsRef = doc(db, Collections.DOCTORS, token.doctorId, "earnings", token.date);
    const [txSnap, earningsSnap, cancelDoctorSnap] = isOnlineToken
      ? await Promise.all([getDoc(txRef), getDoc(earningsRef), getDoc(doctorRef)])
      : [null, null, await getDoc(doctorRef)];
    const storedEarns  = txSnap?.exists() ? (txSnap.data()?.amount ?? 0) : 0;
    const isE          = token.type === "emergency";
    const cancelDrName = cancelDoctorSnap?.exists() ? `Dr. ${(cancelDoctorSnap.data() as any)?.name ?? ""}`.trim() : "your doctor";

    const batch = writeBatch(db);
    batch.update(tokenRef, { status: "cancelled", paymentStatus: "refunded" });
    batch.update(queueRef, {
      totalBooked: increment(-1),
      waitingTokenIds: arrayRemove(tokenId),
      waitingTokenNumbers: arrayRemove(token.tokenNumber),
      updatedAt: Timestamp.now(),
    });

    // Reverse earnings credited at booking time for online paid tokens
    if (isOnlineToken && storedEarns > 0) {
      if (txSnap?.exists()) {
        batch.update(txRef, {
          status:        "refunded",
          paymentStatus: "refunded",
          updatedAt:     Timestamp.now(),
        });
      }
      batch.update(doctorRef, { pendingPayout: increment(-storedEarns) });
      if (earningsSnap?.exists()) {
        batch.update(earningsRef, {
          totalTokens:     increment(-1),
          tokensNormal:    increment(isE ? 0 : -1),
          tokensEmergency: increment(isE ? -1 : 0),
          earned:          increment(-storedEarns),
        });
      }
    }

    await batch.commit();
    emitDoctorTokenChange(token.doctorId);
    try {
      await addDoc(collection(db, Collections.NOTIFICATIONS), {
        doctorId: token.doctorId, type: "token_cancelled",
        title: "Token Cancelled",
        body: `${token.patientName} (${formatTokenLabel(token.tokenNumber, token.type)}) cancelled their appointment.`,
        tokenId, tokenNumber: token.tokenNumber,
        patientName: token.patientName, read: false, createdAt: Timestamp.now(),
      });
    } catch (_) {}
    if (token.patientId) {
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          patientId: token.patientId, type: "token_cancelled",
          title: "Booking Cancelled",
          body: `Your Token ${formatTokenLabel(token.tokenNumber, token.type)} with ${cancelDrName} has been cancelled and your payment will be refunded.`,
          tokenId, tokenNumber: token.tokenNumber,
          read: false, createdAt: Timestamp.now(),
        });
      } catch (_) {}
    }
    res.json({ id: tokenId, status: "cancelled" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens/stream/single/:tokenId
router.get("/tokens/stream/single/:tokenId", async (req, res) => {
  const { tokenId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let doctorId: string | null = null;
  let emitterKey: string | null = null;

  const sendToken = async () => {
    try {
      const snap = await getDoc(doc(db, Collections.TOKENS, tokenId));
      if (!snap.exists()) { res.write(`data: null\n\n`); return; }
      const data = { id: snap.id, ...snap.data() };
      if (!doctorId) doctorId = (data as any).doctorId ?? null;
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (_) {}
  };

  await sendToken();

  const handler = () => sendToken();
  if (doctorId) {
    emitterKey = `tokens:${doctorId}`;
    tokenEmitter.on(emitterKey, handler);
  }

  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch (_) {}
  }, 30_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    if (emitterKey) tokenEmitter.off(emitterKey, handler);
  });
});

// GET /api/tokens/stream/:doctorId
router.get("/tokens/stream/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  const date = (req.query.date as string) || todayDate();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendTokens = async () => {
    try {
      const snap = await getDocs(query(
        collection(db, Collections.TOKENS),
        where("doctorId", "==", doctorId),
        where("date", "==", date),
      ));
      const tokens = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0));
      res.write(`data: ${JSON.stringify(tokens)}\n\n`);
    } catch (_) {}
  };

  await sendTokens();

  const key = `tokens:${doctorId}`;
  const handler = () => sendTokens();
  tokenEmitter.on(key, handler);

  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch (_) {}
  }, 30_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    tokenEmitter.off(key, handler);
  });
});

export default router;
