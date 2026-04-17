const API_KEY = process.env.FAST2SMS_API_KEY ?? "";

function normalize(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits;
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!API_KEY) {
    console.warn("[SMS] FAST2SMS_API_KEY not set — skipping SMS");
    return;
  }
  const to = normalize(phone);
  if (to.length !== 10) {
    console.warn(`[SMS] Invalid phone number (expected 10 digits): ${phone}`);
    return;
  }
  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        numbers: to,
        message,
        flash: 0,
      }),
    });
    const body = await res.text();
    console.log(`[SMS] Sent to ${to}: ${body}`);
  } catch (err: any) {
    console.error(`[SMS] Failed to send to ${to}:`, err?.message);
  }
}
