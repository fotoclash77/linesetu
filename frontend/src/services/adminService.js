const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

async function apiCall(path, method = "POST") {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

export async function approveDoctor(doctorId) {
  return apiCall(`/api/admin/doctors/${doctorId}/approve`);
}

export async function hideDoctor(doctorId) {
  return apiCall(`/api/admin/doctors/${doctorId}/hide`);
}

export async function unhideDoctor(doctorId) {
  return apiCall(`/api/admin/doctors/${doctorId}/unhide`);
}

export async function deleteDoctor(doctorId) {
  return apiCall(`/api/admin/doctors/${doctorId}`, "DELETE");
}

export async function deletePatient(patientId) {
  return apiCall(`/api/admin/patients/${patientId}`, "DELETE");
}
