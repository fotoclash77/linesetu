import React, { useState } from "react";
import { approveDoctor, hideDoctor, unhideDoctor, deleteDoctor } from "../services/adminService";

export default function DoctorRow({ doctor }) {
  const [busy, setBusy] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAction = async (action, label) => {
    setBusy(label);
    try { await action(); } catch (err) { alert(err.message || "Action failed"); }
    finally { setBusy(null); }
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    await handleAction(() => deleteDoctor(doctor.id), "delete");
  };

  const approvalStatus = doctor.isDeleted ? "Deleted" : doctor.isApproved ? "Approved" : "Pending";
  const activeStatus = doctor.isDeleted ? "Deleted" : doctor.isActive ? "Active" : "Hidden";
  const createdDate = doctor.createdAt?.seconds
    ? new Date(doctor.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const activeClinics = (doctor.clinics ?? []).filter(c => c.active && c.name?.trim());

  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${doctor.isDeleted ? "opacity-60" : ""}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {doctor.profilePhoto ? (
              <img src={doctor.profilePhoto} alt={doctor.name} className={`w-9 h-9 rounded-full object-cover ${doctor.isDeleted ? "grayscale" : ""}`} />
            ) : (
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
                {doctor.name?.charAt(0)?.toUpperCase() || "D"}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 text-sm">{doctor.name}</div>
              <div className="text-xs text-gray-500">{doctor.specialization}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{doctor.phone}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{activeClinics.length > 0 ? activeClinics.map(c => c.name).join(", ") : doctor.clinicName || "-"}</td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${doctor.isDeleted ? "bg-gray-200 text-gray-500" : doctor.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{approvalStatus}</span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${doctor.isDeleted ? "bg-gray-200 text-gray-500" : doctor.isActive ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"}`}>{activeStatus}</span>
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">{createdDate}</td>
        <td className="px-4 py-3">
          {doctor.isDeleted ? (
            <span className="text-xs text-gray-400 italic">Removed</span>
          ) : (
            <div className="flex items-center gap-2">
              {!doctor.isApproved && <button onClick={() => handleAction(() => approveDoctor(doctor.id), "approve")} disabled={!!busy} className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors">{busy === "approve" ? "..." : "Approve"}</button>}
              {doctor.isActive ? (
                <button onClick={() => handleAction(() => hideDoctor(doctor.id), "hide")} disabled={!!busy} className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">{busy === "hide" ? "..." : "Hide"}</button>
              ) : (
                <button onClick={() => handleAction(() => unhideDoctor(doctor.id), "unhide")} disabled={!!busy} className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">{busy === "unhide" ? "..." : "Unhide"}</button>
              )}
              <button onClick={() => setShowConfirm(true)} disabled={!!busy} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">{busy === "delete" ? "..." : "Delete"}</button>
            </div>
          )}
        </td>
      </tr>
      {showConfirm && (
        <tr><td colSpan={7} className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-800">Permanently delete Dr. {doctor.name}? <span className="text-xs text-red-600 ml-2">This cannot be undone.</span></span>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700">Cancel</button>
              <button onClick={handleDelete} disabled={!!busy} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-700 text-white hover:bg-red-800 disabled:opacity-50">{busy === "delete" ? "Deleting..." : "Yes, Delete"}</button>
            </div>
          </div>
        </td></tr>
      )}
    </>
  );
}
