import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { db, Collections, doc, getDoc, setDoc, Timestamp } from "../lib/firebase.js";

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "amount (number in paise) is required" });
    }
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`,
      notes: notes ?? {},
    });
    res.json(order);
  } catch (err: any) {
    console.error("[Razorpay] create-order error:", err);
    res.status(500).json({ error: err.message ?? "Failed to create order" });
  }
});

router.post("/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSig === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Signature mismatch" });
    }
  } catch (err: any) {
    console.error("[Razorpay] verify error:", err);
    res.status(500).json({ error: err.message ?? "Verification failed" });
  }
});

// POST /api/razorpay/refund
// Two-factor security:
//   1. HMAC-SHA256 signature (proves the caller witnessed the Razorpay payment)
//   2. Firestore failedBookings/{paymentId} record (proves the server recorded a capacity-full
//      failure for this payment — the record is created ONLY by POST /api/tokens when a booking
//      fails due to full capacity; it cannot be created by any client-facing path)
// These two guards together ensure refunds can only be issued for real failed bookings:
// a payment that was captured but booking capacity was already full at commit time.
router.post("/refund", async (req, res) => {
  try {
    const { paymentId, orderId, razorpay_signature } = req.body;
    if (!paymentId || typeof paymentId !== "string")
      return res.status(400).json({ error: "paymentId is required" });
    if (!orderId || typeof orderId !== "string")
      return res.status(400).json({ error: "orderId is required" });
    if (!razorpay_signature || typeof razorpay_signature !== "string")
      return res.status(400).json({ error: "razorpay_signature is required" });

    // 1. Verify signature — caller must have witnessed the original Razorpay payment
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (expectedSig !== razorpay_signature)
      return res.status(403).json({ error: "Signature verification failed" });

    // 2. Verify a server-created failedBooking record exists for this payment
    //    (only POST /api/tokens writes these records, never a client path)
    const recordRef  = doc(db, Collections.FAILED_BOOKINGS, paymentId);
    const recordSnap = await getDoc(recordRef);
    if (!recordSnap.exists())
      return res.status(403).json({ error: "No capacity-full booking failure recorded for this payment" });

    const record = recordSnap.data() as any;
    if (record.orderId && record.orderId !== orderId)
      return res.status(403).json({ error: "orderId mismatch in booking failure record" });

    // Idempotency: already refunded
    if (record.status === "refunded" && record.refundId)
      return res.json({ success: true, refundId: record.refundId, status: "refunded", amount: record.amount });

    // 3. Verify payment ownership + captured status via Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    const pmtData = payment as any;
    if (pmtData.order_id !== orderId)
      return res.status(403).json({ error: "Payment/order mismatch in Razorpay" });
    if (pmtData.status !== "captured")
      return res.status(409).json({ error: `Payment status '${pmtData.status}' cannot be refunded` });

    // 4. Issue refund and persist result
    await setDoc(recordRef, { status: "pending", updatedAt: Timestamp.now() }, { merge: true });
    const refund = await razorpay.payments.refund(paymentId, {} as Parameters<typeof razorpay.payments.refund>[1]);
    await setDoc(recordRef, { status: "refunded", refundId: refund.id, refundedAt: Timestamp.now() }, { merge: true });

    console.log(`[Razorpay] Client refund issued: ${refund.id} for payment ${paymentId} (order ${orderId})`);
    res.json({ success: true, refundId: refund.id, status: refund.status, amount: refund.amount });
  } catch (err: any) {
    console.error("[Razorpay] refund error:", err);
    res.status(500).json({ error: err.message ?? "Refund failed" });
  }
});

export default router;
