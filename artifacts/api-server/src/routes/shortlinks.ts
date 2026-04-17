import { Router } from "express";
import {
  db, Collections,
  collection, getDocs,
  query, where,
} from "../lib/firebase.js";

const router = Router();

// GET /s/:code — short-link redirect to doctor profile in patient app
router.get("/s/:code", async (req, res) => {
  try {
    const snap = await getDocs(
      query(collection(db, Collections.DOCTORS), where("shortCode", "==", req.params.code))
    );
    if (snap.empty) return res.status(404).send("Link not found");
    const doctorId = snap.docs[0].id;
    const base = `${req.protocol}://${req.get("host")}`;
    res.redirect(302, `${base}/patient-app/doctor/${doctorId}`);
  } catch (err: any) {
    res.status(500).send("Server error");
  }
});

export default router;
