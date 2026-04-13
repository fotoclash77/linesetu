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
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DoctorContext = createContext<DoctorCtx>({
  doctor: null, isLoading: true,
  loginWithOtp: async () => {},
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

  const loginWithOtp = async (phone: string, otp: string) => {
    const res = await fetch(`${BASE()}/api/auth/doctor/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "OTP verification failed");
    const doctorData: DoctorUser = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      specialization: data.specialization || "General Physician",
      clinicName: data.clinicName || "",
      clinicAddress: data.clinicAddress || "",
      profilePhoto: data.profilePhoto || "",
      shifts: data.shifts,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(doctorData));
    setDoctor(doctorData);
  };

  const logout = async () => {
    setDoctor(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DoctorContext.Provider value={{ doctor, isLoading, loginWithOtp, logout }}>
      {children}
    </DoctorContext.Provider>
  );
}
