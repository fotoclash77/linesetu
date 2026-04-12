import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, where, limit,
} from "../lib/firebase.js";

const router = Router();

// POST /api/patients — register or get patient by phone
router.post("/patients", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone is required" });

    const existing = await getDocs(query(
      collection(db, Collections.PATIENTS),
      where("phone", "==", phone),
      limit(1)
    ));

    if (!existing.empty) {
      const d = existing.docs[0];
      return res.json({ id: d.id, ...d.data(), isNew: false });
    }

    const data = {
      name: name || "Patient",
      phone,
      profilePhoto: "",
      fcmToken: "",
      createdAt: Timestamp.now(),
    };
    const ref = await addDoc(collection(db, Collections.PATIENTS), data);
    res.status(201).json({ id: ref.id, ...data, isNew: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:patientId
router.get("/patients/:patientId", async (req, res) => {
  try {
    const snap = await getDoc(doc(db, Collections.PATIENTS, req.params.patientId));
    if (!snap.exists()) return res.status(404).json({ error: "Patient not found" });
    res.json({ id: snap.id, ...snap.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:patientId/tokens — booking history
router.get("/patients/:patientId/tokens", async (req, res) => {
  try {
    const snap = await getDocs(query(
      collection(db, Collections.TOKENS),
      where("patientId", "==", req.params.patientId),
      limit(50)
    ));
    type TokenDoc = { id: string; bookedAt?: { seconds: number } };
    const tokens = snap.docs
      .map(d => ({ id: d.id, ...(d.data() as Omit<TokenDoc, "id">) }))
      .sort((a, b) => {
        const aTime = a.bookedAt?.seconds ?? 0;
        const bTime = b.bookedAt?.seconds ?? 0;
        return bTime - aTime;
      })
      .slice(0, 20);
    res.json({ tokens });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/patients/:patientId
router.patch("/patients/:patientId", async (req, res) => {
  try {
    const allowed = ["name", "fcmToken", "profilePhoto"];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await updateDoc(doc(db, Collections.PATIENTS, req.params.patientId), updates);
    res.json({ id: req.params.patientId, updated: Object.keys(updates) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
