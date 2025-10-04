// src/services/api.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// -------- AUTH (cookie-based) ----------
// src/services/api.js
// src/services/api.js
export async function apiSignup(email, password, role = "user") {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, role }), // backend will ignore/force if you kept Option A
  });
  if (!res.ok) {
    let msg = "Erreur lors de la création du compte";
    try {
      const data = await res.json();
      if (data?.detail) msg = data.detail;
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // { user_id, email, role }
}




export async function apiLogin(email, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // <— important, use cookies across origins
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const msg = await safeText(r);
    throw new Error(msg || `Login failed (${r.status})`);
  }
  return r.json(); // { user: {...} }
}

export async function apiLogout() {
  const r = await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) {
    const msg = await safeText(r);
    throw new Error(msg || `Logout failed (${r.status})`);
  }
  return r.json(); // { ok: true }
}

export async function apiMe() {
  const r = await fetch(`${BASE}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  if (!r.ok) {
    // return null on 401 so context can handle unauthenticated state
    if (r.status === 401) return null;
    const msg = await safeText(r);
    throw new Error(msg || `Me failed (${r.status})`);
  }
  return r.json(); // { user: {...} }
}

// -------- RAG / ASK ----------
export async function ask(q, opts = {}, workspaceId) {
  const params = new URLSearchParams();
  if (workspaceId) params.set("workspace", workspaceId);
  const r = await fetch(`${BASE}/ask?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      q,
      k: opts.k ?? 4,
      min_score: opts.min_score ?? 0.3,
      include_context: !!opts.include_context,
    }),
  });
  if (!r.ok) throw new Error(`ask failed (${r.status})`);
  return r.json();
}

// -------- Workspaces (optional, for your flow) ----------
export async function createWorkspace() {
  const r = await fetch(`${BASE}/workspaces`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) throw new Error(`WS create failed (${r.status})`);
  return r.json(); // { ws_id }
}

export async function buildWorkspace(wsId) {
  const r = await fetch(`${BASE}/workspaces/${wsId}/build`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) throw new Error(`WS build failed (${r.status})`);
  return r.json();
}

export async function uploadDoc(file, wsId) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${BASE}/workspaces/${wsId}/documents`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!r.ok) throw new Error(`upload failed (${r.status})`);
  return r.json();
}

// -------- utils ----------
async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
export async function adminPing() {
  const r = await fetch(`${BASE}/admin/ping`, { credentials: "include" });
  if (!r.ok) throw new Error(`admin ping failed (${r.status})`);
  return r.json();
}

export async function getStats() {
  const r = await fetch(`${BASE}/admin/stats`, { credentials: "include" });
  if (!r.ok) throw new Error(`stats failed (${r.status})`);
  return r.json();
}

export async function adminReindex() {
  const r = await fetch(`${BASE}/admin/reindex`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) throw new Error(`reindex failed (${r.status})`);
  return r.json();
}

export async function adminFlushIndex() {
  const r = await fetch(`${BASE}/admin/flush-index`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) throw new Error(`flush failed (${r.status})`);
  return r.json();
}