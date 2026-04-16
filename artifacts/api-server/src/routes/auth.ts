import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, limit,
} from "../lib/firebase.js";

const router = Router();

// Shared in-memory OTP store
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// ─── POST /api/auth/send-otp ─────────────────────────────────────────────────
router.post("/auth/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "phone is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = String(phone).trim();
  otpStore.set(key, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  console.log(`\n=============================`);
  console.log(`  OTP for [${key}]: ${otp}`);
  console.log(`=============================\n`);

  // devOtp is always returned so the apps can auto-fill in development
  res.json({ success: true, devOtp: otp });
});

// ─── POST /api/auth/verify-otp  (patient app) ────────────────────────────────
router.post("/auth/verify-otp", async (req, res) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: "phone and otp are required" });

  const key = String(phone).trim();
  const otpStr = String(otp).trim();

  console.log(`\n--- verify-otp ---`);
  console.log(`  phone=[${key}] otp=[${otpStr}] storeKeys=`, Array.from(otpStore.keys()));

  const stored = otpStore.get(key);
  if (!stored) {
    console.log(`  FAIL: no stored OTP for key`);
    return res.status(400).json({ error: "No OTP found. Please request a new one." });
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }
  if (stored.otp !== otpStr) {
    console.log(`  FAIL: stored=[${stored.otp}] received=[${otpStr}]`);
    return res.status(400).json({ error: "Invalid OTP. Please try again." });
  }

  otpStore.delete(key);
  console.log(`  OK: OTP verified for [${key}]`);

  try {
    const existing = await getDocs(query(
      collection(db, Collections.PATIENTS),
      where("phone", "==", key),
      limit(1)
    ));

    if (!existing.empty) {
      const d = existing.docs[0];
      return res.json({ id: d.id, ...d.data(), isNew: false });
    }

    const data = {
      name: name || "",
      phone: key,
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

// ─── POST /api/auth/doctor/verify-otp ────────────────────────────────────────
// Doctor-specific verify: checks OTP then looks up / creates a doctor record
router.post("/auth/doctor/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: "phone and otp are required" });

  const key = String(phone).trim();
  const otpStr = String(otp).trim();

  console.log(`\n--- doctor/verify-otp ---`);
  console.log(`  phone=[${key}] otp=[${otpStr}] storeKeys=`, Array.from(otpStore.keys()));

  const stored = otpStore.get(key);
  if (!stored) {
    console.log(`  FAIL: no stored OTP`);
    return res.status(400).json({ error: "No OTP found. Please request a new one." });
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }
  if (stored.otp !== otpStr) {
    console.log(`  FAIL: stored=[${stored.otp}] received=[${otpStr}]`);
    return res.status(400).json({ error: "Invalid OTP." });
  }

  otpStore.delete(key);
  console.log(`  OK: OTP verified for doctor [${key}]`);

  try {
    // Look up doctor by phone (last 10 digits match)
    const snap = await getDocs(collection(db, Collections.DOCTORS));
    const normalized = key.replace(/\D/g, "").slice(-10);
    const match = snap.docs.find(d => {
      const dp = (d.data().phone || "").replace(/\D/g, "").slice(-10);
      return dp === normalized;
    });

    if (match) {
      const matchData = match.data();
      if (matchData.isDeleted) {
        return res.status(403).json({ error: "Account has been deleted. Contact admin.", deleted: true });
      }
      if (!matchData.isActive) {
        await updateDoc(doc(db, Collections.DOCTORS, match.id), { isActive: true });
      }
      return res.json({ id: match.id, ...matchData, isActive: true });
    }

    // No doctor found — create one with a placeholder profile
    const last10 = key.replace(/\D/g, "").slice(-10);
    const data = {
      name: `Dr. ${last10.slice(-4)}`,
      phone: key,
      specialization: "General Physician",
      clinicName: "LINESETU Clinic",
      clinicAddress: "City Centre",
      profilePhoto: "",
      isActive: true,
      isApproved: false,
      isDeleted: false,
      fcmToken: "",
      shifts: {
        morning: true, morningStart: "09:00", morningEnd: "13:00",
        evening: false, eveningStart: "17:00", eveningEnd: "21:00",
      },
      bankAccount: null,
      createdAt: Timestamp.now(),
    };
    const ref = await addDoc(collection(db, Collections.DOCTORS), data);
    console.log(`  Created new doctor: ${ref.id}`);
    return res.status(201).json({ id: ref.id, ...data, isNew: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
