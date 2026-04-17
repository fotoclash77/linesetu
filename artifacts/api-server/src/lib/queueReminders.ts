import {
  db, Collections,
  collection, getDocs,
  query, where,
  withRetry,
} from "./firebase.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
  priority?: "default" | "normal" | "high";
}

async function sendExpoPush(messages: ExpoPushMessage[]): Promise<void> {
  if (!messages.length) return;
  try {
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
    });
  } catch (_) {}
}

export async function sendQueueReminders(
  doctorId: string,
  date: string,
  shift: string,
  waitingTokenNumbers: number[],
): Promise<void> {
  if (!waitingTokenNumbers.length) return;
  try {
    const q = query(
      collection(db, Collections.TOKENS),
      where("doctorId", "==", doctorId),
      where("date",     "==", date),
      where("shift",    "==", shift),
      where("status",   "==", "waiting"),
    );
    const snap = await withRetry(() => getDocs(q));

    const messages: ExpoPushMessage[] = [];

    for (const d of snap.docs) {
      const t = d.data() as any;
      if (!t.expoPushToken || !Array.isArray(t.reminderThresholds)) continue;
      const myToken = t.tokenNumber as number;
      const ahead   = waitingTokenNumbers.filter((n: number) => n < myToken).length;

      // Only notify when ahead count exactly hits a threshold (avoids duplicate alerts)
      const matchedThreshold = (t.reminderThresholds as number[])
        .find((threshold: number) => ahead === threshold);

      if (matchedThreshold === undefined) continue;

      const body = matchedThreshold === 0
        ? "It's your turn! Head to the clinic now."
        : `Only ${matchedThreshold} patient${matchedThreshold === 1 ? "" : "s"} ahead of you. Get ready!`;

      messages.push({
        to: t.expoPushToken,
        title: "LINESETU Queue Update",
        body,
        sound: "default",
        priority: "high",
        data: { tokenId: d.id, doctorId, ahead, threshold: matchedThreshold },
      });
    }

    await sendExpoPush(messages);
  } catch (_) {}
}
