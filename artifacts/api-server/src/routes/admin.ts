import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, updateDoc,
  query, where, writeBatch,
} from "../lib/firebase.js";

const router = Router();

router.post("/admin/doctors/:doctorId/approve", async (req, res) => {
  try {
    const ref = doc(db, Collections.DOCTORS, req.params.doctorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ error: "Doctor not found" });
    const data = snap.data() as any;
    if (data.isDeleted) return res.status(400).json({ error: "Cannot approve deleted doctor" });
    await updateDoc(ref, { isApproved: true });
    res.json({ id: req.params.doctorId, isApproved: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/doctors/:doctorId/hide", async (req, res) => {
  try {
    const ref = doc(db, Collections.DOCTORS, req.params.doctorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ error: "Doctor not found" });
    const data = snap.data() as any;
    if (data.isDeleted) return res.status(400).json({ error: "Cannot hide deleted doctor" });
    await updateDoc(ref, { isActive: false });
    res.json({ id: req.params.doctorId, isActive: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/doctors/:doctorId/unhide", async (req, res) => {
  try {
    const ref = doc(db, Collections.DOCTORS, req.params.doctorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ error: "Doctor not found" });
    const data = snap.data() as any;
    if (data.isDeleted) return res.status(400).json({ error: "Cannot unhide deleted doctor" });
    await updateDoc(ref, { isActive: true });
    res.json({ id: req.params.doctorId, isActive: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/admin/doctors/:doctorId", async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const ref = doc(db, Collections.DOCTORS, doctorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ error: "Doctor not found" });
    const data = snap.data() as any;
    if (data.isDeleted) return res.status(400).json({ error: "Doctor already deleted" });

    await updateDoc(ref, {
      isActive: false,
      isDeleted: true,
      isApproved: false,
      isAvailable: false,
      onlineBooking: false,
      deletedAt: Timestamp.now(),
      shifts: { morning: false, morningStart: "09:00", morningEnd: "13:00", evening: false, eveningStart: "17:00", eveningEnd: "21:00" },
      consultFee: 0,
      emergencyFee: 0,
      walkinFee: 0,
      bankAccount: null,
    });

    const tokensSnap = await getDocs(query(
      collection(db, Collections.TOKENS),
      where("doctorId", "==", doctorId),
      where("status", "in", ["waiting", "in_consult"])
    ));

    if (!tokensSnap.empty) {
      const batch = writeBatch(db);
      tokensSnap.docs.forEach((t) => {
        batch.update(t.ref, {
          status: "cancelled",
          cancelledAt: Timestamp.now(),
          cancelReason: "Doctor account deleted by admin",
        });
      });
      await batch.commit();
    }

    res.json({ id: doctorId, deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
