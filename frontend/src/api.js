/**
 * api.js — Thin fetch wrapper for the Notice Board API.
 * All requests go to VITE_API_URL. Auth token is read from localStorage.
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders(isAdminCall) {
  const adminToken = localStorage.getItem("token");
  const studentToken = localStorage.getItem("student_token");
  const token = isAdminCall ? adminToken : (studentToken || adminToken);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}, isAdminCall = false) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(isAdminCall),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 204) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    if (res.status === 401 && !isAdminCall) {
      localStorage.removeItem("student_token");
      window.dispatchEvent(new Event("unauthorized"));
    }
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

// --- Public / Student ---

export function fetchNotices({ category, q, includeExpired, isAdminCall } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (includeExpired) params.set("include_expired", "true");
  const qs = params.toString();
  return request(`/notices${qs ? `?${qs}` : ""}`, {}, isAdminCall);
}

export function registerStudent(data) {
  return request("/register", { method: "POST", body: JSON.stringify(data) });
}

export function loginStudent(data) {
  return request("/student/login", { method: "POST", body: JSON.stringify(data) });
}

export function getMe() {
  return request("/me");
}

// --- Auth ---

export function login(username, password) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  }, true);
}

// --- Admin CRUD ---

export function createNotice(data) {
  return request("/notices", {
    method: "POST",
    body: JSON.stringify(data),
  }, true);
}

export function updateNotice(id, data) {
  return request(`/notices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, true);
}

export function deleteNotice(id) {
  return request(`/notices/${id}`, { method: "DELETE" }, true);
}

