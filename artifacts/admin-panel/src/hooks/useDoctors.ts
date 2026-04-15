import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, where } from "../lib/firebase";

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
        }))
        .filter((d) => !d.isDeleted) as Doctor[];
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
