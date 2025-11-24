import { auth } from "../firebase";

export async function apiFetch(url, options = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };

  const res = await fetch(`http://localhost:5000${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
