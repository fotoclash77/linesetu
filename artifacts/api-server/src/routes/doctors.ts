import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, where, orderBy, limit,
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
    res.json({ id: snap.id, ...snap.data() });
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
    const allowed = ["name", "specialization", "clinicName", "clinicAddress", "shifts", "calendar", "clinics", "bankAccount", "isActive", "isAvailable", "fcmToken", "profilePhoto", "consultFee", "emergencyFee"];
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

// POST /api/doctors/:doctorId/payouts — request a payout withdrawal
router.post("/doctors/:doctorId/payouts", async (req, res) => {
  try {
    const { upiId, amount } = req.body;
    if (!upiId || !amount) return res.status(400).json({ error: "upiId and amount are required" });

    const doctorRef  = doc(db, Collections.DOCTORS, req.params.doctorId);
    const doctorSnap = await getDoc(doctorRef);
    if (!doctorSnap.exists()) return res.status(404).json({ error: "Doctor not found" });
    const doctorData = doctorSnap.data() as any;

    const pendingPayout = doctorData.pendingPayout ?? 0;
    const requestedAmount = Number(amount);
    if (requestedAmount <= 0) return res.status(400).json({ error: "Amount must be greater than 0" });
    if (requestedAmount > pendingPayout) return res.status(400).json({ error: "Requested amount exceeds available balance" });

    const payoutData = {
      doctorId:    req.params.doctorId,
      doctorName:  doctorData.name || "",
      amount:      requestedAmount,
      upiId,
      requestedAt: Timestamp.now(),
      status:      "pending",
    };

    const payoutRef = await addDoc(collection(db, "payoutRequests"), payoutData);
    // Deduct from pending balance atomically
    await updateDoc(doctorRef, { pendingPayout: increment(-requestedAmount) });

    res.status(201).json({ id: payoutRef.id, ...payoutData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
