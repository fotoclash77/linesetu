import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            ?? "AIzaSyAB8oRHetHbugo8SW6AJgpgh_Zn5DeFRuI",
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? "linesetu77.firebaseapp.com",
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         ?? "linesetu77",
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "linesetu77.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "669948564779",
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             ?? "1:669948564779:web:5cb0991e9e7a9ed065e16e",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithEmailAndPassword, signInWithPopup };
export type { UserCredential };
