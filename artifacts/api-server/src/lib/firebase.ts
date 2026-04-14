import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  runTransaction,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteField,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  throw new Error("FIREBASE_PROJECT_ID is not set");
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

export {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, writeBatch, runTransaction,
  Timestamp, increment, arrayUnion, arrayRemove, deleteField,
};

export const Collections = {
  DOCTORS:         "doctors",
  PATIENTS:        "patients",
  TOKENS:          "tokens",
  QUEUES:          "queues",
  PAYOUTS:         "payouts",
  NOTIFICATIONS:   "notifications",
  FAILED_BOOKINGS: "failedBookings",
} as const;

export function queueDocId(doctorId: string, date: string, shift: "morning" | "evening") {
  return `${doctorId}_${date}_${shift}`;
}

export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}
