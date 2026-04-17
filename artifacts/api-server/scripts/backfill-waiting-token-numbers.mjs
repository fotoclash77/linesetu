/**
 * One-time backfill: populate `waitingTokenNumbers` on queue docs that are missing it.
 *
 * Queue docs created before task #23 don't have the `waitingTokenNumbers` array,
 * so patients see an inflated "patients ahead" count. This script fixes that by
 * joining each affected queue with its waiting tokens and writing the field.
 *
 * Usage (from repo root or api-server dir):
 *   node artifacts/api-server/scripts/backfill-waiting-token-numbers.mjs
 *
 * Requires the same FIREBASE_* env vars that the API server uses.
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";

// ─── Load env vars from .env if running standalone ──────────────────────────
try {
  const { config } = await import("dotenv");
  config();
} catch {
  // dotenv not available; rely on environment being pre-set
}

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("ERROR: FIREBASE_PROJECT_ID is not set. Aborting.");
  process.exit(1);
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

const QUEUES  = "queues";
const TOKENS  = "tokens";

async function run() {
  console.log("=== backfill-waiting-token-numbers ===");
  console.log(`Project: ${firebaseConfig.projectId}`);

  // Fetch all queue documents
  const queuesSnap = await getDocs(collection(db, QUEUES));
  console.log(`Total queue docs found: ${queuesSnap.size}`);

  // Filter to docs where waitingTokenNumbers field is absent (not yet written by task #23).
  // Docs with an empty array [] were written intentionally (e.g. all tokens already called/done)
  // and should not be overwritten — the accurate value there is genuinely [].
  const needsBackfill = queuesSnap.docs.filter((d) => {
    const data = d.data();
    return !Array.isArray(data.waitingTokenNumbers);
  });

  console.log(`Queue docs missing waitingTokenNumbers: ${needsBackfill.length}`);

  if (needsBackfill.length === 0) {
    console.log("Nothing to backfill. Done.");
    return;
  }

  let updated = 0;
  let skipped = 0;

  // Firestore writeBatch limit is 500 ops; process in chunks of 400 to be safe
  const BATCH_LIMIT = 400;

  for (let i = 0; i < needsBackfill.length; i += BATCH_LIMIT) {
    const chunk = needsBackfill.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);

    for (const queueDoc of chunk) {
      const queueData = queueDoc.data();
      const { doctorId, date: qDate, shift } = queueData;

      if (!doctorId || !qDate || !shift) {
        console.warn(`  [SKIP] ${queueDoc.id} — missing doctorId/date/shift fields`);
        skipped++;
        continue;
      }

      // Find all waiting tokens for this queue slot
      const tokensSnap = await getDocs(
        query(
          collection(db, TOKENS),
          where("doctorId", "==", doctorId),
          where("date",     "==", qDate),
          where("shift",    "==", shift),
          where("status",   "==", "waiting"),
        )
      );

      const waitingNumbers = tokensSnap.docs
        .map((t) => t.data().tokenNumber)
        .filter((n) => typeof n === "number")
        .sort((a, b) => a - b);

      console.log(
        `  [UPDATE] ${queueDoc.id} → waitingTokenNumbers: [${waitingNumbers.join(", ")}]`
      );

      batch.update(doc(db, QUEUES, queueDoc.id), {
        waitingTokenNumbers: waitingNumbers,
      });

      updated++;
    }

    await batch.commit();
    console.log(`  Committed batch (${chunk.length} docs processed)`);
  }

  console.log(`\nBackfill complete. Updated: ${updated}, Skipped: ${skipped}`);
}

run().catch((err) => {
  console.error("Fatal error during backfill:", err);
  process.exit(1);
});
