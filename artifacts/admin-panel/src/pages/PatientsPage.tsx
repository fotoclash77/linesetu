import { useState, useMemo } from "react";
import { usePatients } from "../hooks/usePatients";
import { PatientRow } from "../components/PatientRow";

type FilterTab = "all" | "complete" | "incomplete";

export default function PatientsPage() {
  const { patients, loading } = usePatients();
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = patients;
    if (tab === "complete") list = list.filter((p) => p.profileCompleted);
    if (tab === "incomplete") list = list.filter((p) => !p.profileCompleted);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.phone?.includes(s) ||
          p.email?.toLowerCase().includes(s) ||
          p.area?.toLowerCase().includes(s) ||
          p.district?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [patients, tab, search]);

  const counts = useMemo(
    () => ({
      all: patients.length,
      complete: patients.filter((p) => p.profileCompleted).length,
      incomplete: patients.filter((p) => !p.profileCompleted).length,
    }),
    [patients]
  );

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All Patients" },
    { key: "complete", label: "Profile Complete" },
    { key: "incomplete", label: "Profile Incomplete" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-6" data-testid="patients-page">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Patients" value={counts.all} color="indigo" />
        <StatCard label="Profile Complete" value={counts.complete} color="green" />
        <StatCard label="Profile Incomplete" value={counts.incomplete} color="yellow" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                data-testid={`patient-filter-${t.key}`}
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
            data-testid="patient-search-input"
            placeholder="Search by name, phone, email, area..."
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-lg">No patients found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "No patients match this filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" data-testid="patients-table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Profile
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
                {filtered.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "indigo" | "green" | "yellow";
}) {
  const colors = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    green: "bg-green-50 border-green-200 text-green-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`} data-testid={`stat-${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  );
}
