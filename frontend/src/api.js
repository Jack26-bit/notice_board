/**
 * api.js — Thin fetch wrapper for the Notice Board API.
 * All requests go to VITE_API_URL. Auth token is read from localStorage.
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 204) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

// --- Public ---

export function fetchNotices({ category, q, includeExpired } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (includeExpired) params.set("include_expired", "true");
  const qs = params.toString();
  return request(`/notices${qs ? `?${qs}` : ""}`);
}

// --- Auth ---

export function login(username, password) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// --- Admin CRUD ---

export function createNotice(data) {
  return request("/notices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateNotice(id, data) {
  return request(`/notices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteNotice(id) {
  return request(`/notices/${id}`, { method: "DELETE" });
}
