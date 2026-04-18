import { useEffect, useState } from "react";
import { db, collection, onSnapshot } from "../lib/firebase";

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "patients");
    const unsub = onSnapshot(colRef, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, name: "", phone: "", profilePhoto: "", age: "", blood: "", gender: "", email: "", address: "", area: "", state: "", district: "", profileCompleted: false, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setPatients(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { patients, loading };
}

export function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "doctors");
    const unsub = onSnapshot(colRef, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, name: "", phone: "", specialization: "", clinicName: "", profilePhoto: "", isActive: true, isApproved: true, isDeleted: false, isAvailable: false, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setDoctors(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { doctors, loading };
}
