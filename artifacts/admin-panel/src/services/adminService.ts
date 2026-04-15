const API_BASE = import.meta.env.VITE_API_BASE || "";

async function apiCall(path: string, method = "POST") {
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

export async function approveDoctor(doctorId: string) {
  return apiCall(`/api/admin/doctors/${doctorId}/approve`);
}

export async function hideDoctor(doctorId: string) {
  return apiCall(`/api/admin/doctors/${doctorId}/hide`);
}

export async function unhideDoctor(doctorId: string) {
  return apiCall(`/api/admin/doctors/${doctorId}/unhide`);
}

export async function deleteDoctor(doctorId: string) {
  return apiCall(`/api/admin/doctors/${doctorId}`, "DELETE");
}
