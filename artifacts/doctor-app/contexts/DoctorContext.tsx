import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "linesetu_doctor";
const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export interface DoctorUser {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  profilePhoto?: string;
  shifts?: {
    morning: boolean; morningStart: string; morningEnd: string;
    evening: boolean; eveningStart: string; eveningEnd: string;
  };
}

interface DoctorCtx {
  doctor: DoctorUser | null;
  isLoading: boolean;
  loginWithPhone: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DoctorContext = createContext<DoctorCtx>({
  doctor: null, isLoading: true,
  loginWithPhone: async () => {},
  logout: async () => {},
});

export const useDoctor = () => useContext(DoctorContext);

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setDoctor(JSON.parse(raw)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const loginWithPhone = async (phone: string) => {
    const res = await fetch(`${BASE()}/api/doctors`);
    if (!res.ok) throw new Error("Could not fetch doctors");
    const { doctors } = await res.json();
    const normalized = phone.replace(/\D/g, "").slice(-10);
    const found = doctors.find((d: DoctorUser) => {
      const dp = (d.phone || "").replace(/\D/g, "").slice(-10);
      return dp === normalized;
    });
    if (!found) throw new Error("No doctor account found for this number");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    setDoctor(found);
  };

  const logout = async () => {
    setDoctor(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DoctorContext.Provider value={{ doctor, isLoading, loginWithPhone, logout }}>
      {children}
    </DoctorContext.Provider>
  );
}
