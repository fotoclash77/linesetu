import { Router } from "express";
import {
  db, Collections,
  collection, doc, getDocs, getDoc,
  query, where, orderBy,
  queueDocId, todayDate,
} from "../lib/firebase.js";

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

    // Fetch all tokens for this doctor on this date, ordered by token number
    const tokenSnap = await getDocs(query(
      collection(db, Collections.TOKENS),
      where("doctorId", "==", req.params.doctorId),
      where("date", "==", date),
      where("shift", "==", shift),
      orderBy("tokenNumber", "asc")
    ));

    // Filter to active tokens client-side (avoids needing composite index for "in" query)
    const tokens = tokenSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((t: any) => t.status === "waiting" || t.status === "in_consult");

    res.json({ id: queueSnap.id, ...queue, tokens });
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

export default router;
