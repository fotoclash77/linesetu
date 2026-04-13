import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, updateDoc, addDoc,
  query, where, orderBy, limit, writeBatch,
} from "../lib/firebase.js";

const router = Router();

// GET /api/notifications/:doctorId
router.get("/notifications/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const snap = await getDocs(
      query(
        collection(db, Collections.NOTIFICATIONS),
        where("doctorId", "==", doctorId),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    const notifications = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as any)?.toMillis?.() ?? Date.now(),
    }));
    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:notifId/read — mark single notification as read
router.patch("/notifications/:notifId/read", async (req, res) => {
  try {
    const ref = doc(db, Collections.NOTIFICATIONS, req.params.notifId);
    await updateDoc(ref, { read: true });
    res.json({ id: req.params.notifId, read: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/read-all — mark all as read for a doctor
router.post("/notifications/read-all", async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ error: "doctorId required" });

    const snap = await getDocs(
      query(
        collection(db, Collections.NOTIFICATIONS),
        where("doctorId", "==", doctorId),
        where("read", "==", false),
      ),
    );

    if (snap.empty) return res.json({ updated: 0 });

    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();

    res.json({ updated: snap.size });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
