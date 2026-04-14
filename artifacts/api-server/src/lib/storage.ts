const API_KEY = () => process.env.FIREBASE_API_KEY!;
const BUCKET = () => process.env.FIREBASE_STORAGE_BUCKET!;
const LEGACY_BUCKET = () => `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

async function getAnonIdToken(): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  const data = await res.json();
  if (!res.ok || !data.idToken) {
    throw new Error(`Firebase Auth failed: ${data?.error?.message ?? "unknown"}`);
  }
  return data.idToken as string;
}

/**
 * Uploads a base64 image to Firebase Storage via the REST API.
 * Uses an anonymous Firebase Auth token — bypasses the client SDK which
 * breaks in Node.js (no XMLHttpRequest). Default Firebase Storage rules
 * allow reads/writes for authenticated users including anonymous ones.
 */
export async function uploadBase64ToStorage(
  base64: string,
  path: string,
  mimeType: string,
): Promise<string> {
  const idToken = await getAnonIdToken();
  const buffer = Buffer.from(base64, "base64");
  const encodedPath = encodeURIComponent(path);

  const buckets = [BUCKET(), LEGACY_BUCKET()];
  let uploadData: any = null;
  let lastError = "unknown";

  for (const bucket of buckets) {
    const uploadRes = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodedPath}&uploadType=media`,
      {
        method: "POST",
        headers: {
          "Content-Type": mimeType,
          Authorization: `Bearer ${idToken}`,
        },
        body: buffer,
      },
    );
    uploadData = await uploadRes.json();
    if (uploadRes.ok) {
      const token: string = uploadData.downloadTokens;
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;
    }
    lastError = uploadData?.error?.message ?? JSON.stringify(uploadData);
  }

  throw new Error(`Storage upload failed: ${lastError}`);
}

/**
 * Deletes a file from Firebase Storage by its full download URL or storage path.
 * Silently ignores 404 (file already deleted).
 */
export async function deleteFromStorage(urlOrPath: string): Promise<void> {
  try {
    // Extract the path from a full Firebase Storage URL if needed
    let storagePath = urlOrPath;
    if (urlOrPath.startsWith("https://firebasestorage.googleapis.com")) {
      const match = urlOrPath.match(/\/o\/([^?]+)/);
      if (match) storagePath = decodeURIComponent(match[1]);
    }

    const idToken = await getAnonIdToken();
    const encodedPath = encodeURIComponent(storagePath);
    for (const bucket of [BUCKET(), LEGACY_BUCKET()]) {
      const res = await fetch(
        `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${idToken}` } },
      );
      if (res.ok || res.status === 404) return;
    }
  } catch {
    // Non-critical — ignore delete failures
  }
}
