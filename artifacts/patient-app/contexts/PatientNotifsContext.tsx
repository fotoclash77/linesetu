import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnread = useCallback(async () => {
    if (!patient?.id) return;
    try {
      const res = await fetch(`${BASE()}/api/notifications/patient/${patient.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const count = (data.notifications as any[]).filter((n: any) => !n.read).length;
      setUnreadCount(count);
    } catch {
      // network error — keep last count
    }
  }, [patient?.id]);

  useEffect(() => {
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnread]);

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
      // ignore
    }
  }, [patient?.id]);

  return (
    <PatientNotifsContext.Provider value={{ unreadCount, refresh: fetchUnread, markAllRead }}>
      {children}
    </PatientNotifsContext.Provider>
  );
}

export const usePatientNotifs = () => useContext(PatientNotifsContext);
