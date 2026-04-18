import React, { useState, useMemo } from "react";
import { useDoctors } from "../hooks/useData";
import DoctorRow from "../components/DoctorRow";

function StatCard({ label, value, bg }) {
  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  );
}

export default function DoctorsPage() {
  const { doctors, loading } = useDoctors();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    all: doctors.filter(d => !d.isDeleted).length,
    pending: doctors.filter(d => !d.isApproved && !d.isDeleted).length,
    approved: doctors.filter(d => d.isApproved && d.isActive && !d.isDeleted).length,
    hidden: doctors.filter(d => !d.isActive && !d.isDeleted).length,
    deleted: doctors.filter(d => d.isDeleted).length,
  }), [doctors]);

  const filtered = useMemo(() => {
    let list = doctors;
    if (tab === "all") list = list.filter(d => !d.isDeleted);
    if (tab === "pending") list = list.filter(d => !d.isApproved && !d.isDeleted);
    if (tab === "approved") list = list.filter(d => d.isApproved && d.isActive && !d.isDeleted);
    if (tab === "hidden") list = list.filter(d => !d.isActive && !d.isDeleted);
    if (tab === "deleted") list = list.filter(d => d.isDeleted);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(d => d.name?.toLowerCase().includes(s) || d.phone?.includes(s) || d.specialization?.toLowerCase().includes(s));
    }
    return list;
  }, [doctors, tab, search]);

  const tabs = [
    { key: "all", label: "All" }, { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" }, { key: "hidden", label: "Hidden" },
    { key: "deleted", label: "Deleted" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-6" data-testid="doctors-page">
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Doctors" value={counts.all} bg="bg-white border-gray-200 text-gray-900" />
        <StatCard label="Pending Approval" value={counts.pending} bg="bg-yellow-50 border-yellow-200 text-yellow-800" />
        <StatCard label="Active & Approved" value={counts.approved} bg="bg-green-50 border-green-200 text-green-800" />
        <StatCard label="Hidden" value={counts.hidden} bg="bg-orange-50 border-orange-200 text-amber-600" />
        <StatCard label="Deleted" value={counts.deleted} bg="bg-red-50 border-red-200 text-red-800" />
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === t.key ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
          <input type="search" placeholder="Search by name, phone, specialty..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md w-72 focus:outline-none focus:ring-2" />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#0d9488' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="text-lg">No doctors found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b bg-gray-50">
                {["Doctor","Phone","Clinic","Approval","Visibility","Joined","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>{filtered.map(doc => <DoctorRow key={doc.id} doctor={doc} />)}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
