import { useEffect, useState } from "react";
import { db, collection, onSnapshot } from "../lib/firebase";

export interface Doctor {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  clinicName: string;
  profilePhoto: string;
  isActive: boolean;
  isApproved: boolean;
  isDeleted: boolean;
  isAvailable: boolean;
  createdAt: any;
  state?: string;
  district?: string;
  clinics?: { name: string; active: boolean; state?: string; district?: string }[];
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "doctors");

    const unsub = onSnapshot(colRef, (snap) => {
      const list: Doctor[] = snap.docs
        .map((d) => ({
          id: d.id,
          name: "",
          phone: "",
          specialization: "",
          clinicName: "",
          profilePhoto: "",
          isActive: true,
          isApproved: true,
          isDeleted: false,
          isAvailable: false,
          ...d.data(),
        })) as Doctor[];
      list.sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });
      setDoctors(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { doctors, loading };
}
