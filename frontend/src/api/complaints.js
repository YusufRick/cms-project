const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export async function getComplaints(orgId) {
  const res = await fetch(`${API}/complaints/${orgId}`);
  return res.json();
}

export async function createComplaint(orgId, data) {
  const res = await fetch(`${API}/complaints/${orgId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

