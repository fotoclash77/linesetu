import { Router } from "express";
import {
  db, Collections,
  collection, doc, getDocs, getDoc,
  query, where,
  queueDocId, todayDate,
} from "../lib/firebase.js";
import { tokenEmitter } from "../lib/tokenEmitter.js";

const router = Router();

// GET /api/queues/:doctorId — live queue for a doctor
router.get("/queues/:doctorId", async (req, res) => {
  try {
    const { date = todayDate(), shift = "morning" } = req.query as { date?: string; shift?: string };
    const queueRef  = doc(db, Collections.QUEUES, queueDocId(req.params.doctorId, date, shift as "morning" | "evening"));
    const queueSnap = await getDoc(queueRef);

    if (!queueSnap.exists()) {
      return res.json({
        doctorId: req.params.doctorId, date, shift,
        isActive: false, currentToken: 0, nextTokenNumber: 0,
        totalBooked: 0, doneCount: 0, waitingTokenIds: [], tokens: [],
      });
    }

    const queue = queueSnap.data();

    const doctorRef  = doc(db, Collections.DOCTORS, req.params.doctorId);
    const doctorSnap = await getDoc(doctorRef);
    const doctorData = doctorSnap.exists() ? doctorSnap.data() as any : null;
    const shiftCfg   = doctorData?.calendar?.[date]?.[shift];
    const maxTokens  = shiftCfg?.maxTokens ? parseInt(String(shiftCfg.maxTokens), 10) : null;

    const dayNum = String(parseInt(date.split("-")[2] ?? date, 10));
    const tokenSnap = await getDocs(query(
      collection(db, Collections.TOKENS),
      where("doctorId", "==", req.params.doctorId),
      where("shift", "==", shift),
    ));

    const tokens = tokenSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((t: any) => {
        const td = String(t.date ?? "");
        const match = td === date || td === dayNum || parseInt(td, 10) === parseInt(dayNum, 10);
        return match && (t.status === "waiting" || t.status === "in_consult");
      })
      .sort((a: any, b: any) => (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0));

    res.json({ id: queueSnap.id, ...queue, maxTokens, tokens });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/queues/:doctorId/position/:tokenId — patient's live position
router.get("/queues/:doctorId/position/:tokenId", async (req, res) => {
  try {
    const tokenSnap = await getDoc(doc(db, Collections.TOKENS, req.params.tokenId));
    if (!tokenSnap.exists()) return res.status(404).json({ error: "Token not found" });

    const token     = tokenSnap.data();
    const queueSnap = await getDoc(doc(db, Collections.QUEUES,
      queueDocId(token.doctorId, token.date, token.shift)));

    if (!queueSnap.exists()) return res.status(404).json({ error: "Queue not found" });

    const queue             = queueSnap.data();
    const currentToken      = queue.currentToken as number;
    const myToken           = token.tokenNumber as number;
    const position          = Math.max(0, myToken - currentToken);
    const estimatedWaitMins = position * 7;

    res.json({
      tokenId: req.params.tokenId,
      tokenNumber: myToken,
      currentToken,
      position,
      estimatedWaitMins,
      status: token.status,
      totalWaiting: queue.waitingTokenIds?.length ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/queues/:doctorId/next-token/stream", async (req, res) => {
  const { doctorId } = req.params;
  const date  = (req.query.date  as string) || todayDate();
  const shift = (req.query.shift as string) || "morning";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let closed = false;

  const sendNextToken = async () => {
    if (closed) return;
    try {
      const queueRef  = doc(db, Collections.QUEUES, queueDocId(doctorId, date, shift as "morning" | "evening"));
      const queueSnap = await getDoc(queueRef);

      const doctorRef  = doc(db, Collections.DOCTORS, doctorId);
      const doctorSnap = await getDoc(doctorRef);
      const doctorData = doctorSnap.exists() ? doctorSnap.data() as any : null;
      const shiftCfg   = doctorData?.calendar?.[date]?.[shift];
      const maxTokens  = shiftCfg?.maxTokens ? parseInt(String(shiftCfg.maxTokens), 10) : null;

      const nextTokenNumber = queueSnap.exists()
        ? ((queueSnap.data().nextTokenNumber as number) ?? 0) + 1
        : 1;
      const totalBooked = queueSnap.exists()
        ? ((queueSnap.data().totalBooked as number) ?? 0)
        : 0;
      const remaining = maxTokens !== null ? Math.max(0, maxTokens - totalBooked) : null;
      const isFull    = maxTokens !== null && totalBooked >= maxTokens;

      res.write(`data: ${JSON.stringify({
        nextTokenNumber,
        totalBooked,
        maxTokens,
        remaining,
        isFull,
      })}\n\n`);
    } catch (_) {}
  };

  await sendNextToken();

  const emitterKey = `tokens:${doctorId}`;
  const handler = () => sendNextToken();
  tokenEmitter.on(emitterKey, handler);

  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch (_) {}
  }, 30_000);

  req.on("close", () => {
    closed = true;
    clearInterval(heartbeat);
    tokenEmitter.off(emitterKey, handler);
  });
});

router.get("/queues/:doctorId/position/:tokenId/stream", async (req, res) => {
  const { doctorId, tokenId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let closed = false;

  const sendPosition = async () => {
    if (closed) return;
    try {
      const tokenSnap = await getDoc(doc(db, Collections.TOKENS, tokenId));
      if (!tokenSnap.exists()) {
        res.write(`data: ${JSON.stringify({ error: "Token not found" })}\n\n`);
        return;
      }
      const token = tokenSnap.data();
      const queueSnap = await getDoc(doc(db, Collections.QUEUES,
        queueDocId(token.doctorId, token.date, token.shift)));

      if (!queueSnap.exists()) {
        res.write(`data: ${JSON.stringify({ error: "Queue not found" })}\n\n`);
        return;
      }

      const queue = queueSnap.data();
      const currentToken = queue.currentToken as number;
      const myToken = token.tokenNumber as number;
      const position = Math.max(0, myToken - currentToken);
      const estimatedWaitMins = position * 7;

      res.write(`data: ${JSON.stringify({
        tokenId,
        tokenNumber: myToken,
        currentToken,
        position,
        estimatedWaitMins,
        status: token.status,
        totalWaiting: queue.waitingTokenIds?.length ?? 0,
      })}\n\n`);
    } catch (_) {}
  };

  await sendPosition();

  const emitterKey = `tokens:${doctorId}`;
  const handler = () => sendPosition();
  tokenEmitter.on(emitterKey, handler);

  req.on("close", () => {
    closed = true;
    tokenEmitter.off(emitterKey, handler);
  });
});

export default router;
