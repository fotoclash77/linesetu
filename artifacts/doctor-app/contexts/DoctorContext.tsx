import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const STORAGE_KEY = "linesetu_doctor";
const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export type DayStatus = 'holiday' | 'morning_only' | 'evening_only' | 'both';

export interface ClinicEntry {
  name: string; address: string; city: string; phone: string; maps: string; active: boolean;
}

export interface DoctorUser {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  profilePhoto?: string;
  isAvailable?: boolean;
  profileCompleted?: boolean;
  qualifications?: string;
  experience?: string;
  bio?: string;
  totalPatients?: string;
  shifts?: {
    morning: boolean; morningStart: string; morningEnd: string;
    evening: boolean; eveningStart: string; eveningEnd: string;
  };
  calendar?: Record<string, any>;
  clinics?: ClinicEntry[];
  consultFee?: number;
  emergencyFee?: number;
  walkinFee?: number;
  onlineBooking?: boolean;
  emergencyTokens?: boolean;
  showWaitTime?: boolean;
  showPosition?: boolean;
  showFee?: boolean;
  alertMessage?: string;
  results?: string[];
  showResults?: boolean;
  bankAccount?: {
    accountType?: 'bank' | 'upi';
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    branch?: string;
    payoutName?: string;
    payoutCycle?: string;
    payoutEnabled?: boolean;
  };
  notifications?: {
    booking: boolean;
    emergency: boolean;
    payout: boolean;
  };
}

interface DoctorCtx {
  doctor: DoctorUser | null;
  isLoading: boolean;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDoctor: (patch: Partial<DoctorUser>) => Promise<void>;
  setAvailability: (val: boolean) => void;
}

const DoctorContext = createContext<DoctorCtx>({
  doctor: null, isLoading: true,
  loginWithOtp: async () => {},
  logout: async () => {},
  updateDoctor: async () => {},
  setAvailability: () => {},
});

export const useDoctor = () => useContext(DoctorContext);

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setDoctor(JSON.parse(raw)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  // Real-time availability polling — refreshes isAvailable from Firestore every 15s
  useEffect(() => {
    if (!doctor?.id) return;

    const fetchAvailability = async () => {
      try {
        const res = await fetch(`${BASE()}/api/doctors/${doctor.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const fresh = data.isAvailable !== false;
        setDoctor(prev => {
          if (!prev) return prev;
          if (prev.isAvailable === fresh) return prev;
          const updated = { ...prev, isAvailable: fresh };
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
          return updated;
        });
      } catch {}
    };

    fetchAvailability();
    pollRef.current = setInterval(fetchAvailability, 15_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [doctor?.id]);

  const loginWithOtp = async (phone: string, otp: string) => {
    const res = await fetch(`${BASE()}/api/auth/doctor/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "OTP verification failed");
    // Backward compat: treat existing doctors with a full profile as completed
    const alreadyCompleted = data.profileCompleted === true ||
      (data.name?.trim() && data.qualifications?.trim() && data.specialization?.trim() && data.experience?.trim());

    const doctorData: DoctorUser = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      specialization: data.specialization || "General Physician",
      clinicName: data.clinicName || "",
      clinicAddress: data.clinicAddress || "",
      profilePhoto: data.profilePhoto || "",
      isAvailable: data.isAvailable !== false,
      profileCompleted: alreadyCompleted ? true : false,
      qualifications: data.qualifications ?? '',
      experience: data.experience ?? '',
      bio: data.bio ?? '',
      totalPatients: data.totalPatients ?? '',
      shifts: data.shifts,
      calendar: data.calendar,
      clinics: data.clinics ?? undefined,
      consultFee: data.consultFee != null ? Number(data.consultFee) : undefined,
      emergencyFee: data.emergencyFee != null ? Number(data.emergencyFee) : undefined,
      onlineBooking: data.onlineBooking !== false,
      emergencyTokens: data.emergencyTokens !== false,
      showWaitTime: data.showWaitTime !== false,
      showPosition: data.showPosition !== false,
      showFee: data.showFee === true,
      alertMessage: data.alertMessage ?? 'Your turn is coming soon. Please be ready at the clinic.',
      results: Array.isArray(data.results) ? data.results : [],
      showResults: data.showResults !== false,
      walkinFee: data.walkinFee != null ? Number(data.walkinFee) : undefined,
      bankAccount: data.bankAccount ?? undefined,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(doctorData));
    setDoctor(doctorData);
  };

  const updateDoctor = async (patch: Partial<DoctorUser>) => {
    if (!doctor) return;
    const res = await fetch(`${BASE()}/api/doctors/${doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update doctor profile");
    const updated = { ...doctor, ...patch };
    setDoctor(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Instant local update for the availability toggle (no API call — caller handles that)
  const setAvailability = (val: boolean) => {
    setDoctor(prev => {
      if (!prev) return prev;
      const updated = { ...prev, isAvailable: val };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setDoctor(null);
    if (Platform.OS === 'web') {
      // On web, Expo Router resolves '/' to the tabs Home tab (same URL due to transparent group).
      // A full page reload guarantees the login screen renders with cleared storage.
      (window as any).location.replace('/login');
    }
  };

  return (
    <DoctorContext.Provider value={{ doctor, isLoading, loginWithOtp, logout, updateDoctor, setAvailability }}>
      {children}
    </DoctorContext.Provider>
  );
}
