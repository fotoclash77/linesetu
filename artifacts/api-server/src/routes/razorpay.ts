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
// Caller must prove they completed the payment by supplying the Razorpay-issued
// signature (razorpay_order_id|razorpay_payment_id HMAC-SHA256 with KEY_SECRET).
// This re-uses the same verification used in /verify — no extra secrets needed.
router.post("/refund", async (req, res) => {
  try {
    const { paymentId, orderId, razorpay_signature, amount } = req.body;
    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ error: "paymentId (string) is required" });
    }
    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ error: "orderId (string) is required" });
    }
    if (!razorpay_signature || typeof razorpay_signature !== "string") {
      return res.status(400).json({ error: "razorpay_signature (string) is required" });
    }

    // Verify that the caller was present for the original payment
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (expectedSig !== razorpay_signature) {
      return res.status(403).json({ error: "Signature verification failed" });
    }

    const params: Record<string, unknown> = {};
    if (amount && typeof amount === "number" && amount > 0) params.amount = amount;
    const refund = await razorpay.payments.refund(paymentId, params as Parameters<typeof razorpay.payments.refund>[1]);
    console.log(`[Razorpay] Refund: ${refund.id} for payment ${paymentId} (order ${orderId})`);
    res.json({ success: true, refundId: refund.id, status: refund.status, amount: refund.amount });
  } catch (err: any) {
    console.error("[Razorpay] refund error:", err);
    res.status(500).json({ error: err.message ?? "Refund failed" });
  }
});

export default router;
