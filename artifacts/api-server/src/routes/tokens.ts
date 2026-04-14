import { Router } from "express";
import Razorpay from "razorpay";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, addDoc,
  query, where, orderBy, writeBatch, runTransaction,
  arrayUnion, arrayRemove, increment, deleteField,
  queueDocId, todayDate,
} from "../lib/firebase.js";
import { emitDoctorTokenChange, tokenEmitter } from "../lib/tokenEmitter.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

async function issueRefund(paymentId: string) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {} as Parameters<typeof razorpay.payments.refund>[1]);
    console.log(`[Tokens] Auto-refund issued: refundId=${refund.id} paymentId=${paymentId}`);
  } catch (e: any) {
    console.error(`[Tokens] Auto-refund failed for paymentId=${paymentId}:`, e?.message);
  }
}

const RESERVATION_TTL_MS = 5 * 60 * 1000;
const router = Router();

export function countActiveReservations(pending: Record<string, { expiresAt: any }>, excludePatientId?: string): number {
  const now = Date.now();
  return Object.entries(pending).filter(([pid, r]) => {
    if (excludePatientId && pid === excludePatientId) return false;
    const ms = typeof r.expiresAt?.toMillis === "function" ? r.expiresAt.toMillis() : Number(r.expiresAt);
    return ms > now;
  }).length;
}

// POST /api/tokens/reserve — Firestore-atomic soft-lock before payment
router.post("/tokens/reserve", async (req, res) => {
  const { doctorId, patientId, date, shift = "morning" } = req.body;
  if (!doctorId || !patientId) {
    return res.status(400).json({ error: "doctorId and patientId are required" });
  }

  const tokenDate  = date || todayDate();
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
      const pending   = (queueData.pendingReservations ?? {}) as Record<string, { expiresAt: any }>;
      const now       = Date.now();
      const nowTs     = Timestamp.now();

      const existing = pending[patientId];
      const existingExpiresMs = existing
        ? (typeof existing.expiresAt?.toMillis === "function" ? existing.expiresAt.toMillis() : Number(existing.expiresAt))
        : 0;

      if (existing && existingExpiresMs > now) {
        const totalBooked = (queueData.totalBooked as number) ?? 0;
        const otherActive = countActiveReservations(pending, patientId);
        const estimatedToken = totalBooked + otherActive + 1;
        reservedResponse = {
          reserved: true, tokenNumber: estimatedToken,
          expiresAt: existingExpiresMs, ttlMs: existingExpiresMs - now,
        };
        return;
      }

      const totalBooked  = (queueData.totalBooked as number) ?? 0;
      const activeCount  = countActiveReservations(pending);
      const effectiveBooked = totalBooked + activeCount;

      if (maxTokens !== null && effectiveBooked >= maxTokens) {
        throw new Error("CAPACITY_FULL");
      }

      const expiresAt       = Timestamp.fromMillis(now + RESERVATION_TTL_MS);
      const estimatedToken  = totalBooked + activeCount + 1;

      if (queueSnap.exists()) {
        txn.update(queueRef, {
          [`pendingReservations.${patientId}`]: { expiresAt, createdAt: nowTs },
          updatedAt: nowTs,
        });
      } else {
        txn.set(queueRef, {
          doctorId, date: tokenDate, shift,
          isActive: false,
          currentToken: 0,
          nextTokenNumber: 0,
          totalBooked: 0,
          doneCount: 0,
          waitingTokenIds: [],
          pendingReservations: {
            [patientId]: { expiresAt, createdAt: nowTs },
          },
          updatedAt: nowTs,
        });
      }

      reservedResponse = {
        reserved: true, tokenNumber: estimatedToken,
        expiresAt: now + RESERVATION_TTL_MS, ttlMs: RESERVATION_TTL_MS,
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
      age, gender, address, area, notes,
      expectedTokenNumber,
    } = req.body;

    if (!doctorId || !patientName) {
      return res.status(400).json({ error: "doctorId and patientName are required" });
    }

    const tokenDate  = date || todayDate();
    const queueId    = queueDocId(doctorId, tokenDate, shift);
    const queueRef   = doc(db, Collections.QUEUES, queueId);
    const tokenRef   = doc(collection(db, Collections.TOKENS));
    const doctorRef  = doc(db, Collections.DOCTORS, doctorId);
    const doctorSnap = await getDoc(doctorRef);
    const doctorData = doctorSnap.exists() ? doctorSnap.data() as any : null;
    const shiftCfg   = doctorData?.calendar?.[tokenDate]?.[shift];
    const maxTokens  = shiftCfg?.maxTokens ? parseInt(String(shiftCfg.maxTokens), 10) : null;

    const patientPaid = type === "emergency" ? 30 : 20;
    const doctorEarns = type === "emergency" ? 20 : 10;
    const platformFee = 10;

    let resultTokenData: any = null;
    let autoAdjusted = false;

    await runTransaction(db, async (txn) => {
      const queueSnap = await txn.get(queueRef);
      const queueData = queueSnap.exists() ? queueSnap.data() : {} as any;
      const pending   = (queueData.pendingReservations ?? {}) as Record<string, { expiresAt: any }>;

      const currentBooked = (queueData.totalBooked as number) ?? 0;
      const nowMs         = Date.now();

      // Validate reservation freshness — expired entries do NOT grant soft-lock privilege
      const rawReservation  = pending[patientId];
      const reservationExpMs = rawReservation
        ? (typeof rawReservation.expiresAt?.toMillis === "function"
            ? rawReservation.expiresAt.toMillis()
            : Number(rawReservation.expiresAt))
        : 0;
      const hasValidReservation = !!rawReservation && reservationExpMs > nowMs;

      // Active reservations excluding this patient (only fresh ones count)
      const otherActiveCount = countActiveReservations(pending, patientId);
      const effectiveBooked  = currentBooked + otherActiveCount;

      // Patients without a valid reservation must compete against full effectiveBooked
      if (maxTokens !== null && !hasValidReservation && effectiveBooked >= maxTokens) {
        throw new Error("CAPACITY_FULL");
      }
      // Patients with a valid reservation only need committed bookings < maxTokens
      if (maxTokens !== null && hasValidReservation && currentBooked >= maxTokens) {
        throw new Error("CAPACITY_FULL");
      }

      // Token number derived from totalBooked so SSE estimate and assignment always agree
      const nextTokenNumber = currentBooked + 1;

      if (expectedTokenNumber !== undefined && expectedTokenNumber !== null && nextTokenNumber !== Number(expectedTokenNumber)) {
        autoAdjusted = true;
      }

      const nowTs = Timestamp.now();
      const tokenData = {
        tokenNumber: nextTokenNumber,
        doctorId, patientId: patientId || null, patientName,
        patientPhone: patientPhone || "",
        type, source, status: "waiting",
        date: tokenDate, shift,
        patientPaid, doctorEarns, platformFee,
        paymentId: paymentId || "",
        paymentStatus: paymentId ? "paid" : "pending",
        bookedAt: nowTs,
        calledAt: null, doneAt: null,
        age: age || null, gender: gender || null,
        address: address || null, area: area || null,
        notes: notes || null,
      };

      txn.set(tokenRef, tokenData);

      const queueUpdate: Record<string, any> = {
        nextTokenNumber,
        totalBooked: increment(1),
        waitingTokenIds: arrayUnion(tokenRef.id),
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
          pendingReservations: {},
          updatedAt: nowTs,
        });
      }

      resultTokenData = tokenData;
    });

    emitDoctorTokenChange(doctorId);

    const nextTokenNumber = resultTokenData.tokenNumber;

    try {
      await addDoc(collection(db, Collections.NOTIFICATIONS), {
        doctorId, type: "token_booked",
        title: "New E-Token Booked",
        body: `${patientName} booked Token #${nextTokenNumber} for ${tokenDate} (${shift} shift).`,
        tokenId: tokenRef.id, tokenNumber: nextTokenNumber,
        patientName, read: false, createdAt: Timestamp.now(),
      });
    } catch (_) {}

    if (patientId && source !== "walkin") {
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          patientId, type: "token_confirmed",
          title: "Booking Confirmed!",
          body: `Your Token #${nextTokenNumber} has been booked for ${tokenDate} (${shift} shift).`,
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
      if (paymentId) issueRefund(paymentId);
      return res.status(409).json({
        capacityFull: true,
        error: "Booking failed: Slots are full.",
        message: "Booking failed: Slots are full. Refund has been initiated automatically.",
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
    const snap = await getDocs(query(collection(db, Collections.TOKENS), ...constraints));
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
    const snap = await getDocs(
      query(collection(db, Collections.TOKENS),
        where("doctorId", "==", doctorId),
        where("patientPhone", "==", phone),
      ),
    );
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
    const queueRef = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const batch = writeBatch(db);
    batch.update(tokenRef, { status: "in_consult", calledAt: Timestamp.now() });
    batch.update(queueRef, {
      currentToken: token.tokenNumber,
      waitingTokenIds: arrayRemove(req.params.tokenId),
      updatedAt: Timestamp.now(),
    });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);
    res.json({ id: req.params.tokenId, status: "in_consult" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/done
router.patch("/tokens/:tokenId/done", async (req, res) => {
  try {
    const { callNextId } = req.body || {};
    const tokenRef  = doc(db, Collections.TOKENS, req.params.tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token       = tokenSnap.data();
    const queueRef    = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const earningsRef = doc(db, Collections.DOCTORS, token.doctorId, "earnings", token.date);

    let nextToken: any = null;
    let nextRef: any   = null;
    if (callNextId && callNextId !== req.params.tokenId) {
      nextRef = doc(db, Collections.TOKENS, callNextId);
      const nextSnap = await getDoc(nextRef);
      if (nextSnap.exists()) nextToken = nextSnap.data();
    }

    const earningsSnap = await getDoc(earningsRef);
    const isE = token.type === "emergency";
    const batch = writeBatch(db);

    batch.update(tokenRef, { status: "done", doneAt: Timestamp.now() });
    batch.update(queueRef, { doneCount: increment(1), updatedAt: Timestamp.now() });

    if (earningsSnap.exists()) {
      batch.update(earningsRef, {
        totalTokens: increment(1),
        tokensNormal: increment(isE ? 0 : 1),
        tokensEmergency: increment(isE ? 1 : 0),
        earned: increment(token.doctorEarns),
      });
    } else {
      batch.set(earningsRef, {
        date: token.date, totalTokens: 1,
        tokensNormal: isE ? 0 : 1, tokensEmergency: isE ? 1 : 0,
        earned: token.doctorEarns, shift: token.shift,
      });
    }

    if (nextToken && nextRef) {
      const nextQueueRef = doc(db, Collections.QUEUES, queueDocId(nextToken.doctorId, nextToken.date, nextToken.shift));
      batch.update(nextRef, { status: "in_consult", calledAt: Timestamp.now() });
      batch.update(nextQueueRef, {
        currentToken: nextToken.tokenNumber,
        waitingTokenIds: arrayRemove(callNextId),
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();
    emitDoctorTokenChange(token.doctorId);

    res.json({
      id: req.params.tokenId, status: "done",
      calledNext: nextToken ? { id: callNextId, status: "in_consult" } : null,
    });
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
    const existingQ = query(
      collection(db, Collections.TOKENS),
      where("doctorId", "==", token.doctorId),
      where("date",     "==", token.date),
      where("shift",    "==", token.shift),
      where("status",   "==", "up_next"),
    );
    const existingSnap = await getDocs(existingQ);
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
    const queueRef = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const batch = writeBatch(db);
    batch.update(tokenRef, { status: "skipped", skippedAt: Timestamp.now() });
    batch.update(queueRef, { waitingTokenIds: arrayRemove(req.params.tokenId), updatedAt: Timestamp.now() });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);
    res.json({ id: req.params.tokenId, status: "skipped" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/cancel
router.patch("/tokens/:tokenId/cancel", async (req, res) => {
  try {
    const tokenRef  = doc(db, Collections.TOKENS, req.params.tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });
    const token    = tokenSnap.data();
    const queueRef = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const batch = writeBatch(db);
    batch.update(tokenRef, { status: "cancelled", paymentStatus: "refunded" });
    batch.update(queueRef, {
      totalBooked: increment(-1),
      waitingTokenIds: arrayRemove(req.params.tokenId),
      updatedAt: Timestamp.now(),
    });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);
    try {
      await addDoc(collection(db, Collections.NOTIFICATIONS), {
        doctorId: token.doctorId, type: "token_cancelled",
        title: "Token Cancelled",
        body: `${token.patientName} (Token #${token.tokenNumber}) cancelled their appointment.`,
        tokenId: req.params.tokenId, tokenNumber: token.tokenNumber,
        patientName: token.patientName, read: false, createdAt: Timestamp.now(),
      });
    } catch (_) {}
    if (token.patientId) {
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          patientId: token.patientId, type: "token_cancelled",
          title: "Booking Cancelled",
          body: `Your Token #${token.tokenNumber} has been cancelled and your payment will be refunded.`,
          tokenId: req.params.tokenId, tokenNumber: token.tokenNumber,
          read: false, createdAt: Timestamp.now(),
        });
      } catch (_) {}
    }
    res.json({ id: req.params.tokenId, status: "cancelled" });
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
