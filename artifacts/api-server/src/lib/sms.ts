import { db, doc, getDoc } from "./firebase.js";

const API_KEY = process.env.FAST2SMS_API_KEY ?? "";

let cachedEnabled = true;
let cachedAt = 0;
const CACHE_MS = 10_000;

export async function isSmsEnabled(): Promise<boolean> {
  const now = Date.now();
  if (now - cachedAt < CACHE_MS) return cachedEnabled;
  try {
    const snap = await getDoc(doc(db, "appConfig", "sms"));
    cachedEnabled = snap.exists() ? snap.data().enabled !== false : true;
  } catch {
    cachedEnabled = true;
  }
  cachedAt = now;
  return cachedEnabled;
}

function normalize(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits;
}

export async function sendSMS(
  phone: string,
  message: string,
): Promise<{ sent: boolean; skipped: boolean; reason?: string }> {
  if (!(await isSmsEnabled())) {
    console.log("[SMS] Disabled by admin toggle — skipping send");
    return { sent: false, skipped: true, reason: "admin_disabled" };
  }
  if (!API_KEY) return { sent: false, skipped: true, reason: "no_api_key" };
  const to = normalize(phone);
  if (to.length !== 10) return { sent: false, skipped: true, reason: "invalid_phone" };
  try {
    await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ route: "q", numbers: to, message, flash: 0 }),
    });
    return { sent: true, skipped: false };
  } catch (e: any) {
    return { sent: false, skipped: true, reason: e?.message ?? "send_error" };
  }
}
