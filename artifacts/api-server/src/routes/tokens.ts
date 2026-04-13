import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc,
  query, where, orderBy, writeBatch,
  arrayUnion, arrayRemove, increment,
  queueDocId, todayDate,
} from "../lib/firebase.js";
import { emitDoctorTokenChange, tokenEmitter } from "../lib/tokenEmitter.js";

const router = Router();

// POST /api/tokens — book a new token
router.post("/tokens", async (req, res) => {
  try {
    const {
      doctorId, patientId, patientName, patientPhone,
      type = "normal", date, shift = "morning", paymentId,
      source = "online", // 'online' | 'walkin'
    } = req.body;

    if (!doctorId || !patientName) {
      return res.status(400).json({ error: "doctorId and patientName are required" });
    }

    const tokenDate  = date || todayDate();
    const queueId    = queueDocId(doctorId, tokenDate, shift);
    const queueRef   = doc(db, Collections.QUEUES, queueId);
    const queueSnap  = await getDoc(queueRef);

    const nextTokenNumber = queueSnap.exists()
      ? (queueSnap.data().nextTokenNumber as number) + 1
      : 1;

    const patientPaid = type === "emergency" ? 30 : 20;
    const doctorEarns = type === "emergency" ? 20 : 10;
    const platformFee = 10;

    const tokenRef = doc(collection(db, Collections.TOKENS));
    const tokenData = {
      tokenNumber: nextTokenNumber,
      doctorId, patientId: patientId || null, patientName,
      patientPhone: patientPhone || "",
      type,
      source, // 'online' | 'walkin'
      status: "waiting",
      date: tokenDate, shift,
      patientPaid, doctorEarns, platformFee,
      paymentId: paymentId || "",
      paymentStatus: paymentId ? "paid" : "pending",
      bookedAt: Timestamp.now(),
      calledAt: null, doneAt: null,
    };

    const batch = writeBatch(db);
    batch.set(tokenRef, tokenData);

    if (queueSnap.exists()) {
      batch.update(queueRef, {
        nextTokenNumber,
        totalBooked: increment(1),
        waitingTokenIds: arrayUnion(tokenRef.id),
        updatedAt: Timestamp.now(),
      });
    } else {
      batch.set(queueRef, {
        doctorId, date: tokenDate, shift,
        isActive: true,
        currentToken: 0,
        nextTokenNumber,
        totalBooked: 1,
        doneCount: 0,
        waitingTokenIds: [tokenRef.id],
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();
    emitDoctorTokenChange(doctorId);

    // Write a real-time notification for the doctor
    try {
      await addDoc(collection(db, Collections.NOTIFICATIONS), {
        doctorId,
        type: "token_booked",
        title: "New E-Token Booked",
        body: `${patientName} booked Token #${nextTokenNumber} for ${tokenDate} (${shift} shift).`,
        tokenId: tokenRef.id,
        tokenNumber: nextTokenNumber,
        patientName,
        read: false,
        createdAt: Timestamp.now(),
      });
    } catch (_) {}

    // Write a notification for the patient confirming booking (online bookings only)
    if (patientId && source !== "walkin") {
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          patientId,
          type: "token_confirmed",
          title: "Booking Confirmed!",
          body: `Your Token #${nextTokenNumber} has been booked for ${tokenDate} (${shift} shift).`,
          tokenId: tokenRef.id,
          tokenNumber: nextTokenNumber,
          read: false,
          createdAt: Timestamp.now(),
        });
      } catch (_) {}
    }

    res.status(201).json({ id: tokenRef.id, ...tokenData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens
router.get("/tokens", async (req, res) => {
  try {
    const { doctorId, patientId, date, status } = req.query as Record<string, string>;
    const constraints: any[] = [];
    if (doctorId)  constraints.push(where("doctorId", "==", doctorId));
    if (patientId) constraints.push(where("patientId", "==", patientId));
    if (date)      constraints.push(where("date", "==", date));
    if (status)    constraints.push(where("status", "==", status));
    // No orderBy to avoid composite index requirement — sort in memory
    const snap = await getDocs(query(collection(db, Collections.TOKENS), ...constraints));
    const tokens = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0));
    res.json({ tokens });
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

// PATCH /api/tokens/:tokenId/call — doctor calls next patient
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
      currentToken:    token.tokenNumber,
      waitingTokenIds: arrayRemove(req.params.tokenId),
      updatedAt:       Timestamp.now(),
    });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);

    res.json({ id: req.params.tokenId, status: "in_consult" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tokens/:tokenId/done — complete + update daily earnings
router.patch("/tokens/:tokenId/done", async (req, res) => {
  try {
    const tokenRef  = doc(db, Collections.TOKENS, req.params.tokenId);
    const tokenSnap = await getDoc(tokenRef);
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });

    const token       = tokenSnap.data();
    const queueRef    = doc(db, Collections.QUEUES, queueDocId(token.doctorId, token.date, token.shift));
    const earningsRef = doc(db, Collections.DOCTORS, token.doctorId, "earnings", token.date);
    const earningsSnap = await getDoc(earningsRef);
    const isE = token.type === "emergency";

    const batch = writeBatch(db);
    batch.update(tokenRef, { status: "done", doneAt: Timestamp.now() });
    batch.update(queueRef, { doneCount: increment(1), updatedAt: Timestamp.now() });

    if (earningsSnap.exists()) {
      batch.update(earningsRef, {
        totalTokens:     increment(1),
        tokensNormal:    increment(isE ? 0 : 1),
        tokensEmergency: increment(isE ? 1 : 0),
        earned:          increment(token.doctorEarns),
      });
    } else {
      batch.set(earningsRef, {
        date: token.date,
        totalTokens: 1,
        tokensNormal: isE ? 0 : 1,
        tokensEmergency: isE ? 1 : 0,
        earned: token.doctorEarns,
        shift: token.shift,
      });
    }

    await batch.commit();
    emitDoctorTokenChange(token.doctorId);

    res.json({ id: req.params.tokenId, status: "done" });
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
      totalBooked:     increment(-1),
      waitingTokenIds: arrayRemove(req.params.tokenId),
      updatedAt:       Timestamp.now(),
    });
    await batch.commit();
    emitDoctorTokenChange(token.doctorId);

    // Write a notification for the doctor about the cancellation
    try {
      await addDoc(collection(db, Collections.NOTIFICATIONS), {
        doctorId: token.doctorId,
        type: "token_cancelled",
        title: "Token Cancelled",
        body: `${token.patientName} (Token #${token.tokenNumber}) cancelled their appointment.`,
        tokenId: req.params.tokenId,
        tokenNumber: token.tokenNumber,
        patientName: token.patientName,
        read: false,
        createdAt: Timestamp.now(),
      });
    } catch (_) {}

    // Write a notification for the patient about their cancellation
    if (token.patientId) {
      try {
        await addDoc(collection(db, Collections.NOTIFICATIONS), {
          patientId: token.patientId,
          type: "token_cancelled",
          title: "Booking Cancelled",
          body: `Your Token #${token.tokenNumber} has been cancelled and your payment will be refunded.`,
          tokenId: req.params.tokenId,
          tokenNumber: token.tokenNumber,
          read: false,
          createdAt: Timestamp.now(),
        });
      } catch (_) {}
    }

    res.json({ id: req.params.tokenId, status: "cancelled" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens/stream/:doctorId — SSE real-time token stream
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
      const snap = await getDocs(
        query(
          collection(db, Collections.TOKENS),
          where("doctorId", "==", doctorId),
          where("date", "==", date),
          orderBy("tokenNumber", "asc"),
        ),
      );
      const tokens = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      res.write(`data: ${JSON.stringify(tokens)}\n\n`);
    } catch (_) {}
  };

  // Send immediately on connect
  await sendTokens();

  // Listen for changes
  const key = `tokens:${doctorId}`;
  const handler = () => sendTokens();
  tokenEmitter.on(key, handler);

  // Heartbeat every 30s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch (_) {}
  }, 30_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    tokenEmitter.off(key, handler);
  });
});

export default router;
