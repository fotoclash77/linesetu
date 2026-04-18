import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, updateDoc, deleteDoc, addDoc, setDoc,
  query, where, writeBatch, limit, withRetry,
} from "../lib/firebase.js";

const router = Router();

// ─── PATIENT MANAGEMENT ────────────────────────────────────────────────────

// GET /admin/patients — list all patients
router.get("/admin/patients", async (_req, res) => {
  try {
    const snap = await withRetry(() => getDocs(collection(db, Collections.PATIENTS)));
    const patients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    patients.sort((a: any, b: any) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return bTime - aTime;
    });
    res.json({ patients });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/patients/:patientId — hard delete patient + all linked data
router.delete("/admin/patients/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const patientRef = doc(db, Collections.PATIENTS, patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const patientData = patientSnap.data() as any;
    const phone = patientData.phone ?? "";

    // 1. Delete all tokens/bookings for this patient
    const tokensSnap = await getDocs(query(
      collection(db, Collections.TOKENS),
      where("patientId", "==", patientId)
    ));
    if (!tokensSnap.empty) {
      const batch = writeBatch(db);
      tokensSnap.docs.forEach((t) => batch.delete(t.ref));
      await batch.commit();
    }

    // 2. Delete all notifications for this patient
    const notifsSnap = await getDocs(query(
      collection(db, Collections.NOTIFICATIONS),
      where("patientId", "==", patientId)
    ));
    if (!notifsSnap.empty) {
      const batch = writeBatch(db);
      notifsSnap.docs.forEach((n) => batch.delete(n.ref));
      await batch.commit();
    }

    // 3. Log the deletion activity
    await addDoc(collection(db, "adminLogs"), {
      action: "DELETE_PATIENT",
      targetId: patientId,
      targetPhone: phone,
      targetName: patientData.name ?? "",
      adminId: "admin",
      timestamp: Timestamp.now(),
      details: `Hard-deleted patient ${patientData.name || phone}. Tokens deleted: ${tokensSnap.size}, Notifications deleted: ${notifsSnap.size}.`,
    });

    // 4. Hard delete the patient document
    await deleteDoc(patientRef);

    res.json({
      id: patientId,
      deleted: true,
      tokensDeleted: tokensSnap.size,
      notificationsDeleted: notifsSnap.size,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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
