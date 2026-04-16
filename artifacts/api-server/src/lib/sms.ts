const AUTH_KEY    = process.env.MSG91_AUTH_KEY    ?? "";
const SENDER_ID   = process.env.MSG91_SENDER_ID   ?? "LNSETU";
const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID ?? "";
const ROUTE       = "4"; // transactional

function normalize(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!AUTH_KEY) {
    console.warn("[SMS] MSG91_AUTH_KEY not set — skipping SMS");
    return;
  }
  if (!TEMPLATE_ID) {
    console.warn("[SMS] MSG91_TEMPLATE_ID not set — skipping SMS");
    return;
  }
  const to = normalize(phone);
  if (to.length < 10) {
    console.warn(`[SMS] Invalid phone number: ${phone}`);
    return;
  }
  try {
    const url = new URL("https://api.msg91.com/api/v2/sendsms");
    url.searchParams.set("authkey",     AUTH_KEY);
    url.searchParams.set("mobiles",     to);
    url.searchParams.set("message",     message);
    url.searchParams.set("sender",      SENDER_ID);
    url.searchParams.set("route",       ROUTE);
    url.searchParams.set("DLT_TE_ID",  TEMPLATE_ID);

    const res = await fetch(url.toString(), { method: "GET" });
    const body = await res.text();
    console.log(`[SMS] Sent to ${to}: ${body}`);
  } catch (err: any) {
    console.error(`[SMS] Failed to send to ${to}:`, err?.message);
  }
}
