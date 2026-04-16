import { useState, useMemo } from "react";
import { useDoctors } from "../hooks/useDoctors";
import { DoctorRow } from "../components/DoctorRow";

type FilterTab = "all" | "pending" | "approved" | "hidden" | "deleted";

export default function DoctorsPage() {
  const { doctors, loading } = useDoctors();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = doctors;
    if (tab === "all") list = list.filter((d) => !d.isDeleted);
    if (tab === "pending") list = list.filter((d) => !d.isApproved && !d.isDeleted);
    if (tab === "approved") list = list.filter((d) => d.isApproved && d.isActive && !d.isDeleted);
    if (tab === "hidden") list = list.filter((d) => !d.isActive && !d.isDeleted);
    if (tab === "deleted") list = list.filter((d) => d.isDeleted);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          d.phone.includes(s) ||
          d.specialization?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [doctors, tab, search]);

  const counts = useMemo(
    () => ({
      all: doctors.filter((d) => !d.isDeleted).length,
      pending: doctors.filter((d) => !d.isApproved && !d.isDeleted).length,
      approved: doctors.filter((d) => d.isApproved && d.isActive && !d.isDeleted).length,
      hidden: doctors.filter((d) => !d.isActive && !d.isDeleted).length,
      deleted: doctors.filter((d) => d.isDeleted).length,
    }),
    [doctors]
  );

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "hidden", label: "Hidden" },
    { key: "deleted", label: "Deleted" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              LINESETU <span className="text-teal-600">Admin</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Doctor Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Doctors" value={counts.all} color="gray" />
          <StatCard label="Pending Approval" value={counts.pending} color="yellow" />
          <StatCard label="Active & Approved" value={counts.approved} color="green" />
          <StatCard label="Hidden" value={counts.hidden} color="orange" />
          <StatCard label="Deleted" value={counts.deleted} color="red" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === t.key
                      ? "bg-teal-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label} ({counts[t.key]})
                </button>
              ))}
            </div>
            <input
              type="search"
              placeholder="Search by name, phone, specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No doctors found</p>
              <p className="text-sm mt-1">
                {search ? "Try a different search term" : "No doctors match this filter"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Clinic
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Approval
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <DoctorRow key={doc.id} doctor={doc} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "gray" | "yellow" | "green" | "orange" | "red";
}) {
  const colors = {
    gray: "bg-white border-gray-200 text-gray-900",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    green: "bg-green-50 border-green-200 text-green-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  );
}
