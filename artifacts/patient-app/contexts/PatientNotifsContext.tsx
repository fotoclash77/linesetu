import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const BASE = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  return domain ? `https://${domain}` : "";
};

interface PatientNotifsContextType {
  unreadCount: number;
  refresh: () => void;
  markAllRead: () => Promise<void>;
}

const PatientNotifsContext = createContext<PatientNotifsContextType>({
  unreadCount: 0,
  refresh: () => {},
  markAllRead: async () => {},
});

export function PatientNotifsProvider({ children }: { children: React.ReactNode }) {
  const { patient } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!patient?.id) {
      setUnreadCount(0);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("patientId", "==", patient.id),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    }, () => {
      setUnreadCount(0);
    });
    return () => unsub();
  }, [patient?.id]);

  const markAllRead = useCallback(async () => {
    if (!patient?.id) return;
    try {
      await fetch(`${BASE()}/api/notifications/patient-read-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id }),
      });
      setUnreadCount(0);
    } catch {
    }
  }, [patient?.id]);

  return (
    <PatientNotifsContext.Provider value={{ unreadCount, refresh: () => {}, markAllRead }}>
      {children}
    </PatientNotifsContext.Provider>
  );
}

export const usePatientNotifs = () => useContext(PatientNotifsContext);
