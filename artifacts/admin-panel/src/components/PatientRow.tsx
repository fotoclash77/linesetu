import { useState } from "react";
import type { Patient } from "../hooks/usePatients";
import { deletePatient } from "../services/adminService";

interface Props {
  patient: Patient;
}

export function PatientRow({ patient }: Props) {
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    setBusy(true);
    try {
      await deletePatient(patient.id);
      setDeleted(true);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const createdDate = patient.createdAt?.seconds
    ? new Date(patient.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  if (deleted) return null;

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        data-testid={`patient-row-${patient.id}`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {patient.profilePhoto ? (
              <img
                src={patient.profilePhoto}
                alt={patient.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                {patient.name?.charAt(0)?.toUpperCase() || "P"}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 text-sm">
                {patient.name || "No Name"}
              </div>
              {patient.email && (
                <div className="text-xs text-gray-400">{patient.email}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
          {patient.phone}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {[patient.age && `${patient.age}y`, patient.gender, patient.blood]
            .filter(Boolean)
            .join(" · ") || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {[patient.area, patient.district, patient.state]
            .filter(Boolean)
            .join(", ") || "—"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              patient.profileCompleted
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {patient.profileCompleted ? "Complete" : "Incomplete"}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">{createdDate}</td>
        <td className="px-4 py-3">
          <button
            data-testid={`delete-patient-btn-${patient.id}`}
            onClick={() => setShowConfirm(true)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {busy ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete
              </>
            )}
          </button>
        </td>
      </tr>

      {showConfirm && (
        <tr data-testid={`delete-confirm-${patient.id}`}>
          <td colSpan={7} className="px-4 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-red-800">
                    Are you sure you want to delete this patient?
                  </span>
                  <p className="text-xs text-red-600 mt-0.5">
                    This action cannot be undone. All data including profile, appointment history, and token history will be permanently deleted.
                    {patient.phone && (
                      <span className="font-medium"> Phone {patient.phone} will be freed for new registration.</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button
                  data-testid={`delete-cancel-btn-${patient.id}`}
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  data-testid={`delete-confirm-btn-${patient.id}`}
                  onClick={handleDelete}
                  disabled={busy}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                >
                  {busy ? "Deleting..." : "Yes, Delete Permanently"}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
