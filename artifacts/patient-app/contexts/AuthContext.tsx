import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface PatientUser {
  id: string;
  name: string;
  phone: string;
  profilePhoto?: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setPatient(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    });
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
  };

  return (
    <AuthContext.Provider value={{ patient, isLoading, login, logout, updatePatient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
