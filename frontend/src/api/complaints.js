// frontend/src/api/complaints.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // handle non-2xx nicely
  if (!res.ok) {
    let errBody = {};
    try {
      errBody = await res.json();
    } catch (_) {}
    throw new Error(errBody.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// 
export function getMyComplaints(token) {
  return request("/api/complaints", { token });
}

export function createMyComplaint(token, data) {
  return request("/api/complaints", { token, method: "POST", body: data });
}

// Agent/Admin
export function getAllComplaints(token) {
  return request("/api/complaints/all", { token });
}

export function createComplaintAsAgent(token, data) {
  // IMPORTANT: this must match your router.post("/agent", ...)
  return request("/api/complaints/agent", { token, method: "POST", body: data });
}

// Shared
export function updateComplaintStatus(token, id, status) {
  return request(`/api/complaints/${id}`, {
    token,
    method: "PATCH",
    body: { status },
  });
}

export function deleteComplaint(token, id) {
  return request(`/api/complaints/${id}`, { token, method: "DELETE" });
}
