import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, addDoc, getDocs,
  query, where, limit,
} from "../lib/firebase.js";

const router = Router();

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/auth/send-otp
router.post("/auth/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "phone is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(phone, { otp, expiresAt });

  console.log(`\n=============================`);
  console.log(`  OTP for ${phone}: ${otp}`);
  console.log(`=============================\n`);

  res.json({
    success: true,
    message: "OTP generated",
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  });
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: "phone and otp are required" });

  const stored = otpStore.get(phone);
  if (!stored) {
    return res.status(400).json({ error: "No OTP found. Please request a new one." });
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }
  if (stored.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP. Please try again." });
  }

  otpStore.delete(phone);

  try {
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

export default router;
