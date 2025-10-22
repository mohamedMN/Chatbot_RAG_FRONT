// src/services/api.js
import axios from "axios";

const BASE = "http://localhost:8000/api";

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
export async function createWorkspace(sessionId) {
  const { data } = await api.post("/workspaces", null, {
    params: sessionId ? { session_id: sessionId } : {},
  });
  return data; // { ws_id, paths, bound_to_session? }
}

export async function buildWorkspace(wsId) {
  const { data } = await api.post(`/workspaces/${wsId}/build?force=true`);
  return data;
}

export async function askWorkspace(q, opts = {}, ws_id) {
  if (!ws_id) throw new Error("Workspace id is required");
  const r = await fetch(`${BASE}/ask/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      q,
      k: opts.k ?? 4,
      min_score: opts.min_score ?? 0.3,
      include_context: !!opts.include_context,
      session_id: ws_id, // workspace ask expects session_id == ws_id
    }),
  });
  if (!r.ok) throw new Error(`ask(workspace) failed (${r.status})`);
  return r.json();
}

export async function uploadDoc(file, wsId, autoBuild = true) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post(`/workspaces/${wsId}/documents`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
    params: { auto_build: autoBuild },
  });
  return data;
}
// services/api.js
export async function cleanupSession(sessionId, wipeMessages = false) {
  const { data } = await api.post("/workspaces/cleanup-session", null, {
    params: { session_id: sessionId, wipe_messages: wipeMessages },
  });
  return data;
}
async function endSession() {
  const sid =
    sessionId ||
    (typeof window !== "undefined" && localStorage.getItem("session_id"));
  if (!sid) return;

  try {
    setBusy(true);
    await cleanupSession(sid, false); // or true if you want to purge messages/answers too
    setWorkspaceId("");
    setSessionId("");
    try {
      localStorage.removeItem("session_id");
    } catch {}
    pushAssistant(
      "Session terminée. Workspace supprimé et documents nettoyés."
    );
    navigate("/");
  } catch (e) {
    pushError(e?.message || "Échec de fermeture de session");
  } finally {
    setBusy(false);
  }
}

export async function selectProvider(provider /* "ollama" | "groq" */) {
  try {
    const { data } = await axios.post(`${BASE}/llm/select`, { provider });
    // expected: { ok: true, provider: "groq"|"ollama", ready: boolean }
    return data;
  } catch (err) {
    // reuse your error helper if you want; keeping explicit here:
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Provider selection failed";
    throw new Error(msg);
  }
}

export async function getProviderStatus() {
  const { data } = await axios.get(`${BASE}/llm/status`);
  return data; // { ready, active_provider, ... }
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

// ---------------- Messages / Sessions ----------------
export async function getMessagesBySession(
  sessionId,
  { limit = 1000, offset = 0 } = {}
) {
  try {
    const { data } = await api.get("/ask/messages", {
      params: { session_id: sessionId, limit, offset },
    });
    return data; // [{ id, role, content, created_at, ... }]
  } catch (err) {
    throw toError(err, "messages fetch failed");
  }
}

export async function getMySessions({ limit = 100, offset = 0 } = {}) {
  try {
    const { data } = await api.get("/ask/sessions", {
      params: { limit, offset },
    });
    return data; // [{ id, started_at, ... }]
  } catch (err) {
    throw toError(err, "sessions fetch failed");
  }
}

// src/services/api.ts
export async function getTimeseries({ period = "this_week" } = {}) {
  const { data } = await api.get("/admin/metrics/timeseries", {
    params: { period },
  });
  return data;
}
