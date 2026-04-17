import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/firebase";

export interface PatientUser {
  id: string;
  name: string;
  phone: string;
  profilePhoto?: string;
  age?: string;
  blood?: string;
  gender?: string;
  email?: string;
  address?: string;
  area?: string;
  state?: string;
  district?: string;
  profileCompleted?: boolean;
}

interface AuthContextType {
  patient: PatientUser | null;
  isLoading: boolean;
  login: (patient: PatientUser) => Promise<void>;
  logout: () => Promise<void>;
  updatePatient: (updates: Partial<PatientUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  patient: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updatePatient: async () => {},
});

const STORAGE_KEY = "linesetu_patient";

function getApiBase() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:8080";
}

async function validateSession(p: PatientUser): Promise<PatientUser | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const resp = await fetch(`${getApiBase()}/api/patients/${p.id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!resp.ok) return null;
    const fresh = await resp.json();
    return { ...p, ...fresh } as PatientUser;
  } catch {
    clearTimeout(timeoutId);
    return p;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as PatientUser;
          const validated = await validateSession(cached);
          if (validated) {
            setPatient(validated);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        // ignore parse / storage errors
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (p: PatientUser) => {
    setPatient(p);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  };

  const logout = async () => {
    setPatient(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const updatePatient = async (updates: Partial<PatientUser>) => {
    if (!patient) return;
    const updated = { ...patient, ...updates };
    setPatient(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    try {
      await setDoc(doc(db, "patients", patient.id), updates, { merge: true });
    } catch {
      // Firebase not reachable, local update still saved
    }
  };

  return (
    <AuthContext.Provider value={{ patient, isLoading, login, logout, updatePatient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
