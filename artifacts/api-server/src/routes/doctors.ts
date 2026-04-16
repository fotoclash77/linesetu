import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, where, orderBy, limit, increment, runTransaction,
  arrayUnion, arrayRemove, withRetry,
} from "../lib/firebase.js";
import { uploadBase64ToStorage, deleteFromStorage } from "../lib/storage.js";

const router = Router();

// Only expose clinics that are explicitly marked active
function activeClinicOnly(data: any): any {
  if (Array.isArray(data.clinics)) {
    data.clinics = data.clinics.filter((c: any) => c.active === true);
  }
  return data;
}

// GET /api/doctors — list all active, approved, non-deleted doctors (for patient app)
router.get("/doctors", async (req, res) => {
  try {
    const q = query(
      collection(db, Collections.DOCTORS),
      where("isActive", "==", true)
    );
    const snap = await withRetry(() => getDocs(q));
    const doctors = snap.docs
      .map(d => activeClinicOnly({ id: d.id, ...d.data() } as any))
      .filter(d => d.isApproved !== false && !d.isDeleted);
    res.json({ doctors });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/:doctorId
router.get("/doctors/:doctorId", async (req, res) => {
  try {
    const ref = doc(db, Collections.DOCTORS, req.params.doctorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return res.status(404).json({ error: "Doctor not found" });
    const data = snap.data() as any;
    // Lazy backfill: ensure legacy doctor documents have pendingPayout field
    if (data.pendingPayout === undefined) {
      await updateDoc(ref, { pendingPayout: 0 });
      data.pendingPayout = 0;
    }
    res.json(activeClinicOnly({ id: snap.id, ...data }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors — register doctor
router.post("/doctors", async (req, res) => {
  try {
    const { name, phone, specialization, clinicName, clinicAddress, shifts } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "name and phone are required" });

    const data = {
      name,
      phone,
      specialization: specialization || "General Physician",
      clinicName: clinicName || "",
      clinicAddress: clinicAddress || "",
      profilePhoto: "",
      isActive: true,
      isApproved: false,
      isDeleted: false,
      isAvailable: true,
      fcmToken: "",
      shifts: shifts || {
        morning: true, morningStart: "09:00", morningEnd: "13:00",
        evening: false, eveningStart: "17:00", eveningEnd: "21:00",
      },
      consultFee: 10,
      emergencyFee: 20,
      walkinFee: 0,
      pendingPayout: 0,
      bankAccount: null,
      createdAt: Timestamp.now(),
    };

    const ref = await addDoc(collection(db, Collections.DOCTORS), data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/doctors/:doctorId
router.patch("/doctors/:doctorId", async (req, res) => {
  try {
    const allowed = ["name", "specialization", "clinicName", "clinicAddress", "shifts", "calendar", "clinics", "bankAccount", "isActive", "isAvailable", "fcmToken", "profilePhoto", "consultFee", "emergencyFee", "walkinFee", "clinicConsultFee", "clinicEmergencyFee", "qualifications", "experience", "bio", "totalPatients", "phone", "onlineBooking", "emergencyTokens", "showWaitTime", "showPosition", "showDoctorName", "showFee", "alertMessage", "results", "showResults", "notifications", "profileCompleted", "state", "district"];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await updateDoc(doc(db, Collections.DOCTORS, req.params.doctorId), updates);
    res.json({ id: req.params.doctorId, updated: Object.keys(updates) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors/:doctorId/profile-photo — upload / replace profile photo
router.post("/doctors/:doctorId/profile-photo", async (req, res) => {
  try {
    const { base64, mimeType } = req.body as { base64?: string; mimeType?: string };
    if (!base64) return res.status(400).json({ error: "base64 image data required" });
    const mime = mimeType || "image/jpeg";
    const ext = mime.split("/")[1] || "jpg";
    const fileName = `doctor-profiles/${req.params.doctorId}/profile.${ext}`;
    const url = await uploadBase64ToStorage(base64, fileName, mime);
    const docRef = doc(db, Collections.DOCTORS, req.params.doctorId);
    await updateDoc(docRef, { profilePhoto: url });
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors/:doctorId/results — upload a result photo
router.post("/doctors/:doctorId/results", async (req, res) => {
  try {
    const { base64, mimeType } = req.body as { base64?: string; mimeType?: string };
    if (!base64) return res.status(400).json({ error: "base64 image data required" });
    const mime = mimeType || "image/jpeg";
    const ext = mime.split("/")[1] || "jpg";
    const fileName = `doctor-results/${req.params.doctorId}/${Date.now()}.${ext}`;
    const url = await uploadBase64ToStorage(base64, fileName, mime);
    const docRef = doc(db, Collections.DOCTORS, req.params.doctorId);
    await updateDoc(docRef, { results: arrayUnion(url) });
    res.json({ url });
  } catch (err: any) {
    console.error("results upload failed", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/doctors/:doctorId/results — remove a result photo URL
router.delete("/doctors/:doctorId/results", async (req, res) => {
  try {
    const { url } = req.body as { url?: string };
    if (!url) return res.status(400).json({ error: "url is required" });
    const docRef = doc(db, Collections.DOCTORS, req.params.doctorId);
    await updateDoc(docRef, { results: arrayRemove(url) });
    await deleteFromStorage(url);
    res.json({ removed: url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/:doctorId/earnings
router.get("/doctors/:doctorId/earnings", async (req, res) => {
  try {
    const { from, to, limit: limitParam } = req.query as { from?: string; to?: string; limit?: string };
    const maxRecords = Math.min(parseInt(limitParam ?? "365", 10) || 365, 730);
    const colRef = collection(db, Collections.DOCTORS, req.params.doctorId, "earnings");
    const constraints: any[] = [];
    if (from) constraints.push(where("date", ">=", from));
    if (to)   constraints.push(where("date", "<=", to));
    constraints.push(orderBy("date", "desc"));
    constraints.push(limit(maxRecords));
    const snap = await withRetry(() => getDocs(query(colRef, ...constraints)));
    const earnings = snap.docs.map(d => ({ date: d.id, ...d.data() }));
    res.json({ earnings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/:doctorId/transactions
router.get("/doctors/:doctorId/transactions", async (req, res) => {
  try {
    const snap = await withRetry(() => getDocs(query(
      collection(db, Collections.TRANSACTIONS),
      where("doctorId", "==", req.params.doctorId),
      limit(500),
    )));
    const transactions = snap.docs
      .map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toMillis?.() ?? null,
          updatedAt: data.updatedAt?.toMillis?.() ?? null,
        };
      })
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    res.json({ transactions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors/:doctorId/payouts — request a payout withdrawal
router.post("/doctors/:doctorId/payouts", async (req, res) => {
  try {
    const { upiId, amount } = req.body;
    if (!upiId || amount === undefined || amount === null) return res.status(400).json({ error: "upiId and amount are required" });
    // Basic UPI ID format validation: localpart@bank (e.g., name@okaxis, 9876543210@paytm)
    const upiPattern = /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9]+$/;
    if (!upiPattern.test(String(upiId).trim())) return res.status(400).json({ error: "Invalid UPI ID format. Expected format: name@bank" });

    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || !Number.isInteger(requestedAmount)) {
      return res.status(400).json({ error: "Amount must be a positive whole number in rupees" });
    }

    const doctorRef    = doc(db, Collections.DOCTORS, req.params.doctorId);
    const newPayoutRef = doc(collection(db, "payoutRequests"));
    let payoutData: any;

    // Atomic transaction: check balance, create payout doc, decrement pendingPayout
    await runTransaction(db, async (transaction) => {
      const doctorSnap = await transaction.get(doctorRef);
      if (!doctorSnap.exists()) throw Object.assign(new Error("Doctor not found"), { status: 404 });
      const doctorData = doctorSnap.data() as any;
      const pendingPayout = doctorData.pendingPayout ?? 0;
      if (requestedAmount > pendingPayout) throw Object.assign(new Error("Requested amount exceeds available balance"), { status: 400 });
      payoutData = {
        doctorId:    req.params.doctorId,
        doctorName:  doctorData.name || "",
        amount:      requestedAmount,
        upiId:       String(upiId).trim(),
        requestedAt: Timestamp.now(),
        status:      "pending",
      };
      transaction.set(newPayoutRef, payoutData);
      transaction.update(doctorRef, { pendingPayout: increment(-requestedAmount) });
    });

    res.status(201).json({ id: newPayoutRef.id, ...payoutData });
  } catch (err: any) {
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    res.status(status).json({ error: err.message });
  }
});

// GET /api/doctors/:doctorId/payouts — list payout requests (admin-ready structure)
router.get("/doctors/:doctorId/payouts", async (req, res) => {
  try {
    const snap = await withRetry(() => getDocs(query(
      collection(db, "payoutRequests"),
      where("doctorId", "==", req.params.doctorId),
      orderBy("requestedAt", "desc"),
    )));
    const payouts = snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        requestedAt: data.requestedAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
    res.json({ payouts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/doctors/:doctorId — fully execute all 4 stated consequences
router.delete("/doctors/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // ① Profile removed from Patient App — mark inactive, erase practice data
    await updateDoc(doc(db, Collections.DOCTORS, doctorId), {
      isActive:        false,
      isDeleted:       true,
      deletedAt:       Timestamp.now(),
      // Erase clinic, schedule, fee, and payout data
      clinics:         [],
      calendar:        {},
      onlineBooking:   false,
      emergencyTokens: false,
      shifts:          deleteField(),
      consultFee:      deleteField(),
      emergencyFee:    deleteField(),
      walkinFee:       deleteField(),
      bankAccount:     deleteField(),
      alertMessage:    deleteField(),
    });

    // ② Cancel all active/waiting tokens for this doctor
    const tokensSnap = await withRetry(() => getDocs(
      query(
        collection(db, Collections.TOKENS),
        where("doctorId", "==", doctorId),
        where("status", "in", ["waiting", "in_consult"]),
      )
    ));

    // ③ Cancel all pending payout requests
    const payoutsSnap = await withRetry(() => getDocs(
      query(
        collection(db, Collections.PAYOUTS),
        where("doctorId", "==", doctorId),
        where("status",   "==", "pending"),
      )
    ));

    // Batch-write cancellations (Firestore max 500 per batch)
    const writes = [
      ...tokensSnap.docs.map(d => ({
        ref: d.ref,
        data: { status: "cancelled", cancelReason: "Doctor account deleted", cancelledAt: Timestamp.now() },
      })),
      ...payoutsSnap.docs.map(d => ({
        ref: d.ref,
        data: { status: "cancelled", cancelReason: "Doctor account deleted", cancelledAt: Timestamp.now() },
      })),
    ];

    for (let i = 0; i < writes.length; i += 450) {
      const batch = writeBatch(db);
      writes.slice(i, i + 450).forEach(({ ref, data }) => batch.update(ref, data));
      await batch.commit();
    }

    res.json({
      success: true,
      cancelledTokens:  tokensSnap.docs.length,
      cancelledPayouts: payoutsSnap.docs.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feedback
router.post("/feedback", async (req, res) => {
  try {
    const { doctorId, category, message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    await addDoc(collection(db, "feedback"), {
      doctorId: doctorId ?? null,
      category: category ?? "General",
      message: message.trim(),
      source: "doctor-app",
      createdAt: Timestamp.now(),
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
