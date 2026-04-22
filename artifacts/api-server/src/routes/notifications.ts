import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, updateDoc, addDoc,
  query, where, orderBy, limit, writeBatch, withRetry,
} from "../lib/firebase.js";
import { sendSMS } from "../lib/sms.js";

const router = Router();

router.get("/notifications/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const snap = await withRetry(() => getDocs(query(collection(db, Collections.NOTIFICATIONS), where("patientId", "==", patientId), limit(50))));
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: (d.data().createdAt as any)?.toMillis?.() ?? Date.now() })).sort((a: any, b: any) => b.createdAt - a.createdAt);
    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/notifications/send-alert", async (req, res) => {
  try {
    const { tokenId, message, patientId, phone, doctorId, doctorName } = req.body;
    if (!patientId || !message) return res.status(400).json({ error: "patientId and message are required" });
    const trimmed = String(message).slice(0, 60);
    const notif = await addDoc(collection(db, Collections.NOTIFICATIONS), {
      patientId, doctorId: doctorId ?? null, doctorName: doctorName ?? null, tokenId: tokenId ?? null,
      type: "alert", title: "Message from your doctor", message: trimmed, read: false, createdAt: Timestamp.now(),
    });
    let smsStatus = "not_configured";
    if (phone) {
      const drName = doctorName ? (String(doctorName).startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`) : null;
      const smsBody = drName ? `${trimmed}\n-${drName} (LineSetu App)` : trimmed;
      await sendSMS(phone, smsBody);
      smsStatus = "sent";
    }
    res.json({ notificationId: notif.id, smsStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
