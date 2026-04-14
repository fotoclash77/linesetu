import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, where, orderBy, limit, increment, runTransaction,
  arrayUnion, arrayRemove,
  storage, storageRef, uploadString, getDownloadURL, deleteObject,
} from "../lib/firebase.js";

const router = Router();

// GET /api/doctors — list all active doctors
router.get("/doctors", async (req, res) => {
  try {
    const q = query(
      collection(db, Collections.DOCTORS),
      where("isActive", "==", true)
    );
    const snap = await getDocs(q);
    const doctors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    res.json({ id: snap.id, ...data });
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
    const allowed = ["name", "specialization", "clinicName", "clinicAddress", "shifts", "calendar", "clinics", "bankAccount", "isActive", "isAvailable", "fcmToken", "profilePhoto", "consultFee", "emergencyFee", "walkinFee", "qualifications", "experience", "bio", "totalPatients", "phone", "onlineBooking", "emergencyTokens", "showWaitTime", "showPosition", "showDoctorName", "showFee", "alertMessage", "results", "showResults"];
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

// POST /api/doctors/:doctorId/results — upload a result photo
router.post("/doctors/:doctorId/results", async (req, res) => {
  try {
    const { base64, mimeType } = req.body as { base64?: string; mimeType?: string };
    if (!base64) return res.status(400).json({ error: "base64 image data required" });
    const mime = mimeType || "image/jpeg";
    const ext = mime.split("/")[1] || "jpg";
    const fileName = `doctor-results/${req.params.doctorId}/${Date.now()}.${ext}`;
    const fileRef = storageRef(storage, fileName);
    await uploadString(fileRef, base64, "base64", { contentType: mime });
    const url = await getDownloadURL(fileRef);
    const docRef = doc(db, Collections.DOCTORS, req.params.doctorId);
    await updateDoc(docRef, { results: arrayUnion(url) });
    res.json({ url });
  } catch (err: any) {
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
    try {
      const fileRef = storageRef(storage, url);
      await deleteObject(fileRef);
    } catch {}
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
    const snap = await getDocs(query(colRef, ...constraints));
    const earnings = snap.docs.map(d => ({ date: d.id, ...d.data() }));
    res.json({ earnings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/:doctorId/transactions
router.get("/doctors/:doctorId/transactions", async (req, res) => {
  try {
    const snap = await getDocs(query(
      collection(db, Collections.TRANSACTIONS),
      where("doctorId", "==", req.params.doctorId),
      limit(500),
    ));
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
    const snap = await getDocs(query(
      collection(db, "payoutRequests"),
      where("doctorId", "==", req.params.doctorId),
      orderBy("requestedAt", "desc"),
    ));
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

export default router;
