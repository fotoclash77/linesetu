import React, { useState, useMemo } from "react";
import { usePatients } from "../hooks/useData";
import PatientRow from "../components/PatientRow";

function StatCard({ label, value, bg }) {
  return (
    <div className={`rounded-lg border p-4 ${bg}`} data-testid={`stat-${label.replace(/\s/g,'-').toLowerCase()}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  );
}

export default function PatientsPage() {
  const { patients, loading } = usePatients();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    all: patients.length,
    complete: patients.filter(p => p.profileCompleted).length,
    incomplete: patients.filter(p => !p.profileCompleted).length,
  }), [patients]);

  const filtered = useMemo(() => {
    let list = patients;
    if (tab === "complete") list = list.filter(p => p.profileCompleted);
    if (tab === "incomplete") list = list.filter(p => !p.profileCompleted);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(s) || p.phone?.includes(s) || p.email?.toLowerCase().includes(s) || p.district?.toLowerCase().includes(s));
    }
    return list;
  }, [patients, tab, search]);

  const tabs = [
    { key: "all", label: "All Patients" },
    { key: "complete", label: "Profile Complete" },
    { key: "incomplete", label: "Profile Incomplete" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-6" data-testid="patients-page">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Patients" value={counts.all} bg="bg-indigo-50 border-indigo-200 text-indigo-800" />
        <StatCard label="Profile Complete" value={counts.complete} bg="bg-green-50 border-green-200 text-green-800" />
        <StatCard label="Profile Incomplete" value={counts.incomplete} bg="bg-yellow-50 border-yellow-200 text-yellow-800" />
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.key} data-testid={`filter-${t.key}`} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === t.key ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
          <input type="search" data-testid="patient-search" placeholder="Search by name, phone, email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md w-72 focus:outline-none focus:ring-2" />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#0d9488' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="text-lg">No patients found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" data-testid="patients-table">
              <thead><tr className="border-b bg-gray-50">
                {["Patient","Phone","Details","Location","Profile","Joined","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>{filtered.map(p => <PatientRow key={p.id} patient={p} />)}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
