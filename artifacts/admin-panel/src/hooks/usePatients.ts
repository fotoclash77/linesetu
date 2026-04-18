import { useEffect, useState } from "react";
import { db, collection, onSnapshot } from "../lib/firebase";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  profilePhoto: string;
  age: string;
  blood: string;
  gender: string;
  email: string;
  address: string;
  area: string;
  state: string;
  district: string;
  profileCompleted: boolean;
  fcmToken: string;
  createdAt: any;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "patients");

    const unsub = onSnapshot(colRef, (snap) => {
      const list: Patient[] = snap.docs.map((d) => ({
        id: d.id,
        name: "",
        phone: "",
        profilePhoto: "",
        age: "",
        blood: "",
        gender: "",
        email: "",
        address: "",
        area: "",
        state: "",
        district: "",
        profileCompleted: false,
        fcmToken: "",
        ...d.data(),
      })) as Patient[];

      list.sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });

      setPatients(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { patients, loading };
}
