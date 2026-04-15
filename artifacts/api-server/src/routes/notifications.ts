import { Router } from "express";
import {
  db, Collections, Timestamp,
  collection, doc, getDocs, getDoc, updateDoc, addDoc,
  query, where, orderBy, limit, writeBatch, withRetry,
} from "../lib/firebase.js";

const router = Router();

// GET /api/notifications/patient/:patientId
router.get("/notifications/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const snap = await withRetry(() => getDocs(
      query(
        collection(db, Collections.NOTIFICATIONS),
        where("patientId", "==", patientId),
        limit(50),
      ),
    ));
    const notifications = snap.docs
      .map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt as any)?.toMillis?.() ?? Date.now(),
      }))
      .sort((a: any, b: any) => b.createdAt - a.createdAt);
    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/patient-read-all — mark all patient notifications as read
router.post("/notifications/patient-read-all", async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: "patientId required" });
    const snap = await withRetry(() => getDocs(
      query(
        collection(db, Collections.NOTIFICATIONS),
        where("patientId", "==", patientId),
      ),
    ));
    const unread = snap.docs.filter(d => d.data().read === false);
    if (unread.length === 0) return res.json({ updated: 0 });
    const batch = writeBatch(db);
    unread.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
    res.json({ updated: unread.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/:doctorId
router.get("/notifications/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    // No orderBy to avoid composite index requirement — sort in memory
    const snap = await withRetry(() => getDocs(
      query(
        collection(db, Collections.NOTIFICATIONS),
        where("doctorId", "==", doctorId),
        limit(50),
      ),
    ));
    const notifications = snap.docs
      .map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt as any)?.toMillis?.() ?? Date.now(),
      }))
      .sort((a: any, b: any) => b.createdAt - a.createdAt);
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

    // Fetch all for this doctor, filter unread in memory to avoid composite index
    const snap = await withRetry(() => getDocs(
      query(
        collection(db, Collections.NOTIFICATIONS),
        where("doctorId", "==", doctorId),
      ),
    ));

    const unread = snap.docs.filter(d => d.data().read === false);
    if (unread.length === 0) return res.json({ updated: 0 });

    const batch = writeBatch(db);
    unread.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();

    res.json({ updated: unread.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/send-alert — write in-app notification + send SMS
router.post("/notifications/send-alert", async (req, res) => {
  try {
    const { tokenId, message, patientId, phone, doctorId, doctorName } = req.body;
    if (!patientId || !message) {
      return res.status(400).json({ error: "patientId and message are required" });
    }
    const trimmed = String(message).slice(0, 60);

    // 1. Write Firestore notification (patient app polls this)
    const notif = await addDoc(collection(db, Collections.NOTIFICATIONS), {
      patientId,
      doctorId:   doctorId   ?? null,
      doctorName: doctorName ?? null,
      tokenId:    tokenId    ?? null,
      type:       "alert",
      title:      "Message from your doctor",
      message:    trimmed,
      read:       false,
      createdAt:  Timestamp.now(),
    });

    // 2. Try SMS via Fast2SMS (India) — needs FAST2SMS_API_KEY secret
    let smsStatus = "not_configured";
    let smsDebug: any = null;
    const fast2smsKey = process.env.FAST2SMS_API_KEY?.trim();
    console.log("[SMS] FAST2SMS_API_KEY present:", !!fast2smsKey, "| phone:", phone);
    if (fast2smsKey && phone) {
      try {
        const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
        // Append doctor name to SMS (non-editable, fetched from account)
        const drName = doctorName
          ? (String(doctorName).startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`)
          : null;
        const smsBody = drName ? `${trimmed}\n-${drName}` : trimmed;
        console.log("[SMS] Sending to:", cleanPhone, "| body:", smsBody);

        // Use POST with Authorization header (recommended by Fast2SMS)
        const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": fast2smsKey,
            "Content-Type":  "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            route:    "q",
            message:  smsBody,
            language: "english",
            numbers:  cleanPhone,
          }),
        });
        const smsText = await smsRes.text();
        console.log("[SMS] Fast2SMS raw response:", smsText);
        try {
          const smsJson = JSON.parse(smsText);
          smsDebug  = smsJson;
          smsStatus = smsJson.return === true ? "sent" : `failed: ${smsJson.message ?? smsText}`;
        } catch {
          smsStatus = `parse_error: ${smsText.slice(0, 200)}`;
        }
      } catch (smsErr: any) {
        smsStatus = "error";
        console.error("[SMS] Fast2SMS fetch error:", smsErr?.message);
      }
    } else {
      if (!fast2smsKey) console.warn("[SMS] FAST2SMS_API_KEY is not set");
      if (!phone)       console.warn("[SMS] No phone number provided in request");
    }
    console.log("[SMS] Final status:", smsStatus, "| debug:", JSON.stringify(smsDebug));

    res.json({ notificationId: notif.id, smsStatus, smsDebug });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
