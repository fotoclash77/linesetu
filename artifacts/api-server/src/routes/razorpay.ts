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

function requireRefundSecret(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const provided = req.headers["x-refund-secret"];
  if (!secret || !provided || provided !== secret) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

router.post("/refund", requireRefundSecret, async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ error: "paymentId (string) is required" });
    }
    const params: Record<string, unknown> = {};
    if (amount && typeof amount === "number" && amount > 0) params.amount = amount;
    const refund = await razorpay.payments.refund(paymentId, params as Parameters<typeof razorpay.payments.refund>[1]);
    console.log(`[Razorpay] Refund initiated: ${refund.id} for payment ${paymentId}`);
    res.json({ success: true, refundId: refund.id, status: refund.status, amount: refund.amount });
  } catch (err: any) {
    console.error("[Razorpay] refund error:", err);
    res.status(500).json({ error: err.message ?? "Refund failed" });
  }
});

export default router;
