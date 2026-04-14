import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

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
// Authenticated via Razorpay-issued HMAC-SHA256 signature (same as /verify).
// Only callers who witnessed the original Razorpay payment can produce this signature.
// Additionally, the payment is fetched from Razorpay to confirm captured status
// before any refund is issued — preventing arbitrary or post-success refund abuse.
router.post("/refund", async (req, res) => {
  try {
    const { paymentId, orderId, razorpay_signature, amount } = req.body;
    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ error: "paymentId is required" });
    }
    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ error: "orderId is required" });
    }
    if (!razorpay_signature || typeof razorpay_signature !== "string") {
      return res.status(400).json({ error: "razorpay_signature is required" });
    }

    // Step 1: Verify signature — caller must have been part of the original payment
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (expectedSig !== razorpay_signature) {
      return res.status(403).json({ error: "Signature verification failed" });
    }

    // Step 2: Fetch payment from Razorpay and verify it is captured and not already refunded
    const payment = await razorpay.payments.fetch(paymentId);
    const pmtData = payment as any;
    if (pmtData.order_id !== orderId) {
      return res.status(403).json({ error: "Payment/order mismatch" });
    }
    if (pmtData.status !== "captured") {
      return res.status(409).json({ error: `Payment status is '${pmtData.status}'; only 'captured' payments can be refunded` });
    }
    if (pmtData.amount_refunded && pmtData.amount_refunded >= pmtData.amount) {
      return res.status(409).json({ error: "Payment has already been fully refunded" });
    }

    const params: Record<string, unknown> = {};
    if (amount && typeof amount === "number" && amount > 0) params.amount = amount;
    const refund = await razorpay.payments.refund(paymentId, params as Parameters<typeof razorpay.payments.refund>[1]);
    console.log(`[Razorpay] Client-initiated refund: ${refund.id} for payment ${paymentId} (order ${orderId})`);
    res.json({ success: true, refundId: refund.id, status: refund.status, amount: refund.amount });
  } catch (err: any) {
    console.error("[Razorpay] refund error:", err);
    res.status(500).json({ error: err.message ?? "Refund failed" });
  }
});

export default router;
