const API_KEY = () => process.env.FIREBASE_API_KEY!;
const BUCKET = () => process.env.FIREBASE_STORAGE_BUCKET!;

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
 * Requires Firebase Storage Security Rules to allow authenticated writes,
 * e.g.:  allow read, write: if request.auth != null;
 */
export async function uploadBase64ToStorage(
  base64: string,
  path: string,
  mimeType: string,
): Promise<string> {
  const idToken = await getAnonIdToken();
  const buffer = Buffer.from(base64, "base64");
  const encodedPath = encodeURIComponent(path);
  const bucket = BUCKET();

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

  const raw = await uploadRes.text();
  let uploadData: any = null;
  try {
    uploadData = raw ? JSON.parse(raw) : null;
  } catch {
    uploadData = raw;
  }

  if (!uploadRes.ok) {
    const msg = uploadData?.error?.message ?? raw ?? `HTTP ${uploadRes.status}`;
    if (uploadRes.status === 403) {
      throw new Error(
        `Storage upload denied (check Firebase Storage Rules — allow write: if request.auth != null): ${msg}`,
      );
    }
    throw new Error(`Storage upload failed (${uploadRes.status}): ${msg}`);
  }

  const token: string = uploadData?.downloadTokens ?? "";
  if (!token) throw new Error("Storage upload succeeded but no download token was returned");
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;
}

/**
 * Deletes a file from Firebase Storage by its full download URL or storage path.
 */
export async function deleteFromStorage(urlOrPath: string): Promise<void> {
  try {
    let storagePath = urlOrPath;
    if (urlOrPath.startsWith("https://firebasestorage.googleapis.com")) {
      const match = urlOrPath.match(/\/o\/([^?]+)/);
      if (match) storagePath = decodeURIComponent(match[1]);
    }
    const idToken = await getAnonIdToken();
    const encodedPath = encodeURIComponent(storagePath);
    await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${BUCKET()}/o/${encodedPath}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${idToken}` } },
    );
  } catch {
    // Non-critical — ignore delete failures
  }
}
