// src/services/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// ---------------------------------------------
// Axios instance (cookies, baseURL, erreurs)
// ---------------------------------------------
const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // important pour les cookies cross-origin
  headers: { "Content-Type": "application/json" },
});

// formateur d'erreur lisible
function toError(err, fallback = "Request failed") {
  if (err?.response?.data) {
    const d = err.response.data;
    const msg = d.detail || d.message || d.error;
    if (msg) return new Error(msg);
  }
  if (err?.message) return new Error(err.message);
  return new Error(fallback);
}

// ---------------------------------------------
// AUTH (cookie-based)
// ---------------------------------------------
export async function apiSignup(email, password, role = "user") {
  try {
    const { data } = await api.post("/auth/signup", { email, password, role });
    return data; // { user_id, email, role }
  } catch (err) {
    throw toError(err, "Erreur lors de la création du compte");
  }
}

export async function apiLogin(email, password) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return data; // { user: {...} }
  } catch (err) {
    throw toError(err, "Login failed");
  }
}

export async function apiLogout() {
  try {
    const { data } = await api.post("/auth/logout");
    return data; // { ok: true }
  } catch (err) {
    throw toError(err, "Logout failed");
  }
}

export async function apiMe() {
  try {
    const { data } = await api.get("/auth/me");
    return data; // { user: {...} }
  } catch (err) {
    // renvoyer null sur 401 pour gérer l'état non authentifié côté contexte
    if (err?.response?.status === 401) return null;
    throw toError(err, "Me failed");
  }
}

// ---------------------------------------------
// RAG / ASK
// ---------------------------------------------
export async function ask(q, opts = {}, session_id) {
  const r = await fetch(`${BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      q,
      k: opts.k ?? 4,
      min_score: opts.min_score ?? 0.3,
      include_context: !!opts.include_context,
      session_id: session_id || null, // <- keep same session
    }),
  });
  if (!r.ok) throw new Error(`ask failed (${r.status})`);
  return r.json(); // { answer, session_id, ... }
}

// ---------------------------------------------
// Workspaces
// ---------------------------------------------
export async function createWorkspace() {
  try {
    const { data } = await api.post("/workspaces");
    return data; // { ws_id }
  } catch (err) {
    throw toError(err, "WS create failed");
  }
}

export async function buildWorkspace(wsId) {
  try {
    const { data } = await api.post(`/workspaces/${wsId}/build`);
    return data;
  } catch (err) {
    throw toError(err, "WS build failed");
  }
}

export async function uploadDoc(file, wsId) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post(`/workspaces/${wsId}/documents`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw toError(err, "upload failed");
  }
}

// ---------------------------------------------
// Admin
// ---------------------------------------------
export async function adminPing() {
  try {
    const { data } = await api.get("/admin/ping");
    return data;
  } catch (err) {
    throw toError(err, "admin ping failed");
  }
}

export async function getStats() {
  try {
    const { data } = await api.get("/admin/stats");
    return data;
  } catch (err) {
    throw toError(err, "stats failed");
  }
}

export async function adminReindex() {
  try {
    const { data } = await api.post("/admin/reindex");
    return data;
  } catch (err) {
    throw toError(err, "reindex failed");
  }
}

export async function adminFlushIndex() {
  try {
    const { data } = await api.post("/admin/flush-index?wipe_db=true");
    return data;
  } catch (err) {
    throw toError(err, "flush failed");
  }
}

export async function getAdminConfig() {
  try {
    const { data } = await api.get("/admin/config");
    return data;
  } catch (err) {
    throw toError(err, "config failed");
  }
}
