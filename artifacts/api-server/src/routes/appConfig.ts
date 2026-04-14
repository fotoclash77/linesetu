import { Router } from "express";
import {
  db, Timestamp,
  doc, getDoc, setDoc, updateDoc,
} from "../lib/firebase.js";

const router = Router();

const VALID_APP_IDS = ["doctor-app", "patient-app"] as const;
type AppId = typeof VALID_APP_IDS[number];

const DEFAULT_CONFIG = (appId: AppId) => ({
  appId,
  forceUpdate: false,
  minVersion: "1.0.0",
  updateMessage: "A new version of the app is available with improvements and bug fixes. Please update to continue.",
  playStoreUrl: "",
  appStoreUrl: "",
  updatedAt: null,
});

// GET /api/app-config/:appId — get force update config (called by apps on startup + polling)
router.get("/app-config/:appId", async (req, res) => {
  try {
    const appId = req.params.appId as AppId;
    if (!VALID_APP_IDS.includes(appId)) {
      return res.status(400).json({ error: "Invalid appId. Must be 'doctor-app' or 'patient-app'" });
    }
    const snap = await getDoc(doc(db, "appConfig", appId));
    if (!snap.exists()) {
      return res.json(DEFAULT_CONFIG(appId));
    }
    res.json({ appId, ...snap.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/app-config/:appId — update force update config (admin panel)
router.patch("/app-config/:appId", async (req, res) => {
  try {
    const appId = req.params.appId as AppId;
    if (!VALID_APP_IDS.includes(appId)) {
      return res.status(400).json({ error: "Invalid appId" });
    }

    const { forceUpdate, minVersion, updateMessage, playStoreUrl, appStoreUrl } = req.body;
    const updates: Record<string, any> = { updatedAt: Timestamp.now() };

    if (typeof forceUpdate === "boolean")    updates.forceUpdate    = forceUpdate;
    if (typeof minVersion === "string")     updates.minVersion     = minVersion;
    if (typeof updateMessage === "string")  updates.updateMessage  = updateMessage;
    if (typeof playStoreUrl === "string")   updates.playStoreUrl   = playStoreUrl;
    if (typeof appStoreUrl === "string")    updates.appStoreUrl    = appStoreUrl;

    const ref = doc(db, "appConfig", appId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { ...DEFAULT_CONFIG(appId), ...updates });
    } else {
      await updateDoc(ref, updates);
    }
    const updated = await getDoc(ref);
    res.json({ appId, ...updated.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
