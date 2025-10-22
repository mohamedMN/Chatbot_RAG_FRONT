// src/pages/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  ask,
  askWorkspace,
  uploadDoc,
  createWorkspace,
  buildWorkspace,
  selectProvider,
  getProviderStatus,
} from "../services/api.js";
import { useAuth } from "../state/AuthContext.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatHeader from "../components/ChatHeader.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import {
  Paperclip,
  Trash2,
  Loader2,
  FolderPlus,
  Wrench,
  LogOut,
} from "lucide-react";
import AnswerBlock from "../components/AnswerBlock.jsx";
/* ---------------------------- Inline UI widgets --------------------------- */
// Map backend → UI label and UI → backend label
const toUI = (p) =>
  String(p || "")
    .toLowerCase()
    .trim() === "lmstudio"
    ? "ollama"
    : String(p || "");
const toBackend = (p) =>
  String(p || "")
    .toLowerCase()
    .trim() === "ollama"
    ? "lmstudio"
    : String(p || "");

function SourceSwitch({ mode, setMode, disabled }) {
  const Opt = ({ value, label }) => {
    const active = mode === value;
    return (
      <button
        type="button"
        onClick={() => setMode(value)}
        disabled={disabled && value === "workspace"}
        className={[
          "px-3 py-1.5 text-sm rounded-lg border transition",
          active
            ? "bg-orange-brand text-black border-orange-brand"
            : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10",
          disabled && value === "workspace"
            ? "opacity-50 cursor-not-allowed"
            : "",
        ].join(" ")}
        title={
          value === "workspace" && disabled
            ? "Créez/assurez un workspace d’abord"
            : ""
        }
      >
        {label}
      </button>
    );
  };
  return (
    <div className="inline-flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
      <Opt value="workspace" label="Workspace" />
      <Opt value="global" label="Global" />
    </div>
  );
}

function ProviderSwitch({ value, onChange, disabled, ready }) {
  // always compare using the UI label ("ollama" | "groq")
  const uiValue = toUI(value).toLowerCase();

  const Btn = ({ id, label }) => {
    const isActive = uiValue === id; // id is "ollama" or "groq"
    return (
      <button
        type="button"
        onClick={() => onChange(id)}
        disabled={disabled}
        className={[
          "px-3 py-1.5 text-sm rounded-lg border transition",
          isActive
            ? "bg-orange-brand text-black border-orange-brand"
            : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
        <Btn id="ollama" label="Local (Ollama)" />
        <Btn id="groq" label="Cloud (Groq)" />
      </div>
      {typeof ready === "boolean" && (
        <span
          className={[
            "text-xs rounded px-2 py-0.5 border",
            ready
              ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
              : "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
          ].join(" ")}
          title={ready ? "Fournisseur prêt" : "Fournisseur non prêt"}
        >
          {ready ? "ready" : "not ready"}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */

// ---------- localStorage utils ----------
const LS_NAMESPACE = "ob-chat:history";
const safeParse = (s, fallback) => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
};
const keyForUser = (userId) => `${LS_NAMESPACE}:${userId || "anon"}`;
const ensureClientSessionId = () => {
  let sid = localStorage.getItem("session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("session_id", sid);
  }
  return sid;
};

export default function Chat() {
  const { user, logout } = useAuth();

  // UI / state
  const [model, setModel] = useState("Standard");
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Choisissez la source (Workspace/Global) et le fournisseur LLM (Local Ollama / Cloud Groq), puis posez votre question.",
    },
  ]);
  const [history, setHistory] = useState([]);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [sessionId, setSessionId] = useState(
    (typeof window !== "undefined" && localStorage.getItem("session_id")) || ""
  );
  const [workspaceId, setWorkspaceId] = useState("");
  const [sourceMode, setSourceMode] = useState("workspace"); // 'workspace' | 'global'

  const [provider, setProvider] = useState(
    (typeof window !== "undefined" && localStorage.getItem("llm_provider")) ||
      "ollama"
  ); // 'ollama' | 'groq'
  const [providerReady, setProviderReady] = useState(null); // boolean | null

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  // Refs
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);
  const announcedWorkspaceRef = useRef(false);

  // ---------- Load & persist history ----------
  useEffect(() => {
    const key = keyForUser(user?.id);
    const initial = safeParse(localStorage.getItem(key), []);
    setHistory(initial);
  }, [user?.id]);

  useEffect(() => {
    const key = keyForUser(user?.id);
    try {
      localStorage.setItem(key, JSON.stringify(history));
    } catch {}
  }, [history, user?.id]);

  // ---------- Ensure session/workspace on mount ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sid = sessionId || ensureClientSessionId();
      if (!sessionId) setSessionId(sid);

      try {
        const ws = await createWorkspace(sid); // idempotent (ws_id = sid)
        if (cancelled) return;
        setWorkspaceId(ws.ws_id);

        if (!announcedWorkspaceRef.current) {
          announcedWorkspaceRef.current = true;
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content: `✨ Workspace prêt: **${ws.ws_id}**. Importez vos documents puis interrogez en mode **Workspace**.`,
            },
          ]);
        }
      } catch {
        // still fine in Global mode
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Select initial provider (status first; else select saved) ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const st = await getProviderStatus(); // GET /api/llm/status
        let active = st?.active_provider || null;
        let ready = !!st?.ready;

        if (!active) {
          const sel = await selectProvider(provider); // POST /api/llm/select
          active = sel.provider;
          ready = !!sel.ready;
        }

        if (cancelled) return;
        setProvider(active || provider);
        setProviderReady(ready);
        localStorage.setItem("llm_provider", active || provider);

        if (!ready) {
          const name = active || provider;
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content:
                `ℹ️ Le fournisseur **${name}** n'est pas prêt. ` +
                (name === "ollama"
                  ? "Assurez-vous qu'Ollama tourne et que le modèle est téléchargé."
                  : "Vérifiez la clé d'API Groq côté serveur."),
            },
          ]);
        }
      } catch {
        if (cancelled) return;
        setProviderReady(false);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "⚠️ Impossible de sélectionner le fournisseur au démarrage. On reste sur Local (Ollama).",
          },
        ]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- helpers -----
  function handleLogout() {
    try {
      // Nettoyage léger côté client (optionnel)
      localStorage.removeItem("session_id");
      // Si tu veux aussi purger l’historique associé à l’utilisateur:
      try {
        localStorage.removeItem(keyForUser(user?.id));
      } catch {}
      // Tu peux aussi remettre certains états à zéro si tu veux:
      // setSessionId(""); setWorkspaceId(""); setHistory([]); setMessages([...]);
    } finally {
      logout(); // fait la vraie déconnexion (AuthContext)
    }
  }

  function pushAssistant(text) {
    setMessages((m) => [...m, { role: "assistant", content: text }]);
  }
  function pushError(text) {
    setMessages((m) => [...m, { role: "assistant", content: "❌ " + text }]);
  }
  function showToast(text, ms = 2500) {
    setToast(text);
    if (ms) setTimeout(() => setToast(""), ms);
  }

  async function handleProviderChange(next) {
    if (busy) return;
    try {
      setBusy(true);
      const resp = await selectProvider(next);
      setProvider(resp.provider);
      setProviderReady(!!resp.ready);

      localStorage.setItem("llm_provider", resp.provider);
      showToast(
        `Fournisseur: ${resp.provider} (${resp.ready ? "ready" : "not ready"})`
      );
      pushAssistant(
        `🧠 LLM sélectionné: **${resp.provider}** · état: **${
          resp.ready ? "ready" : "not ready"
        }**`
      );
    } catch (e) {
      pushError(e?.message || "Impossible de sélectionner le fournisseur");
    } finally {
      setBusy(false);
    }
  }

  // ----- send -----
  async function send() {
    const text = q.trim();
    if (!text || busy) return;

    if (sourceMode === "workspace" && !workspaceId) {
      showToast("Créez/assurez un workspace d’abord (ou passez en Global).");
      return;
    }

    setBusy(true);

    // Push user's message immediately
    setMessages((m) => [...m, { role: "user", content: text }]);
    setQ("");

    try {
      const opts = { k: 6, min_score: 0.3, include_context: true };
      const res =
        sourceMode === "workspace"
          ? await askWorkspace(text, opts, workspaceId)
          : await ask(text, opts, sessionId || null);

      // persist first session id if server returns one (global path)
      if (!sessionId && res.session_id) {
        setSessionId(res.session_id);
        localStorage.setItem("session_id", res.session_id);
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          context: res.context,
          hits: res.hits,
        },
      ]);
    } catch (e) {
      const msg = /workspace index missing/i.test(String(e?.message || ""))
        ? "Workspace index manquant. Cliquez sur “Rebuild index”, puis réessayez."
        : e?.message || "Erreur /ask";
      pushError(msg);
    } finally {
      setBusy(false);
    }
  }

  // ----- drag & drop -----
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDragOver = (e) => {
      prevent(e);
      setDragOver(true);
    };
    const onDragLeave = (e) => {
      prevent(e);
      setDragOver(false);
    };
    const onDrop = async (e) => {
      prevent(e);
      setDragOver(false);
      const list = Array.from(e.dataTransfer.files || []);
      if (!list.length) return;
      await doUpload(list);
    };
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [workspaceId]);

  // ----- upload logic -----
  async function doUpload(list) {
    const sid = sessionId || ensureClientSessionId();
    if (!sessionId) setSessionId(sid);

    if (!workspaceId) {
      try {
        const ws = await createWorkspace(sid);
        setWorkspaceId(ws.ws_id);
        if (!announcedWorkspaceRef.current) {
          announcedWorkspaceRef.current = true;
          pushAssistant(`✨ Workspace **${ws.ws_id}** prêt pour vos imports.`);
        }
      } catch (e) {
        pushError(e?.message || "Impossible de préparer le workspace");
        return;
      }
    }

    for (const file of list) {
      pushAssistant(`📄 Import de ${file.name}…`);
      try {
        await uploadDoc(file, workspaceId, true); // backend can auto-build
        pushAssistant(
          `✅ ${file.name} importé. L’index du workspace sera mis à jour.`
        );
      } catch (err) {
        pushError(`Import échoué: ${err?.message || "échec réseau"}`);
      }
    }
  }

  function removeFileAt(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ----- explicit workspace actions -----
  async function doCreateWorkspace() {
    try {
      setBusy(true);
      const sid = sessionId || ensureClientSessionId();
      if (!sessionId) setSessionId(sid);
      const w = await createWorkspace(sid); // idempotent
      setWorkspaceId(w.ws_id);
      showToast(`Workspace prêt: ${w.ws_id}`);
      if (!announcedWorkspaceRef.current) {
        announcedWorkspaceRef.current = true;
        pushAssistant(
          `✨ Workspace **${w.ws_id}** prêt. Importez vos documents — puis interrogez en mode Workspace.`
        );
      }
    } catch (e) {
      pushError(e?.message || "Impossible d'assurer le workspace");
    } finally {
      setBusy(false);
    }
  }

  async function doBuildWorkspace() {
    if (!workspaceId) {
      showToast("Créez/assurez un workspace d’abord.");
      return;
    }
    try {
      setBusy(true);
      const r = await buildWorkspace(workspaceId);
      const stats = r?.build?.stats ||
        r?.stats || { total_chunks: "?", total_vectors: "?" };
      showToast("Index reconstruit.");
      pushAssistant(
        `🔧 Index reconstruit pour **${workspaceId}** — chunks: ${stats.total_chunks}, vecteurs: ${stats.total_vectors}.`
      );
    } catch (e) {
      pushError(e?.message || "Échec du rebuild");
    } finally {
      setBusy(false);
    }
  }

  // ----- history actions -----
  function newChat() {
    setHistory((h) => [
      ...h,
      {
        id: crypto.randomUUID(),
        title:
          messages.find((m) => m.role === "user")?.content?.slice(0, 40) ||
          "Nouvelle conversation",
        subtitle: new Date().toLocaleString(),
        snapshot: messages,
        createdAt: Date.now(),
      },
    ]);
    setMessages([
      {
        role: "assistant",
        content: `Nouveau chat. Workspace: **${
          workspaceId || "—"
        }**. Source: **${sourceMode}**. LLM: **${provider}**`,
      },
    ]);
  }

  function openChat(h) {
    if (!h?.snapshot) return;
    setMessages(h.snapshot);
  }

  function deleteAll() {
    setHistory([]);
    try {
      localStorage.removeItem(keyForUser(user?.id));
    } catch {}
  }

  // ----- UI -----
  return (
    <div className="min-h-dvh flex relative bg-gradient-to-b from-[#0b0f14] via-[#0b0f14] to-[#0e1218] text-white">
      {/* Left Sidebar */}
      <ChatSidebar
        history={history}
        onNew={newChat}
        onSelect={openChat}
        onDeleteAll={deleteAll}
        onLogout={handleLogout} // ⬅️ ici
      />

      {/* Right – Chat area */}
      <div
        className="flex-1 grid grid-rows-[auto_auto_1fr_auto] relative"
        ref={dropRef}
      >
        {/* Top header (model) */}
        <ChatHeader model={model} setModel={setModel} />

        {/* Control bar */}
        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10 disabled:opacity-50"
            onClick={doCreateWorkspace}
            disabled={busy}
            title="Assurer/Créer le workspace lié à la session"
          >
            <FolderPlus className="h-4 w-4" />
            Assurer workspace
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10 disabled={busy || !workspaceId}"
            onClick={doBuildWorkspace}
            disabled={busy || !workspaceId}
            title="Reconstruire FAISS pour ce workspace"
          >
            <Wrench className="h-4 w-4" />
            Rebuild index
          </button>

          {/* Source selector */}
          <div className="ml-4">
            <SourceSwitch
              mode={sourceMode}
              setMode={setSourceMode}
              disabled={!workspaceId}
            />
          </div>

          {/* Provider selector */}
          <div className="ml-4">
            <ProviderSwitch
              value={provider}
              onChange={handleProviderChange}
              disabled={busy}
              ready={providerReady}
            />
          </div>

          <div className="ml-auto flex items-center gap-3 text-xs text-white/70">
            {busy && <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />}
            <span>
              Session:{" "}
              <span className="font-mono text-white/90">
                {sessionId ? String(sessionId).slice(0, 8) : "—"}
              </span>
            </span>
            <span>
              Workspace:{" "}
              <span className="font-mono text-white/90">
                {workspaceId || "—"}
              </span>
            </span>
            <span>
              Source:{" "}
              <span className="font-mono text-white/90">
                {sourceMode === "workspace" ? "Workspace" : "Global"}
              </span>
            </span>
            <span>
              LLM: <span className="font-mono text-white/90">{provider}</span>
            </span>
          </div>
        </div>
        {/* Workspace banner */}
        {workspaceId && (
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-200 border-b border-emerald-400/20 text-sm">
            ✅ Workspace actif:{" "}
            <span className="font-mono text-emerald-100">{workspaceId}</span>.
            Importez vos documents puis choisissez <b>Workspace</b> pour
            interroger uniquement ce contenu.
          </div>
        )}

        {/* Messages */}
        <main className="overflow-y-auto p-6 relative">
          {dragOver && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-lg border-2 border-dashed border-orange-brand/60 bg-black/40">
              <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-3">
                Déposez vos fichiers pour les envoyer au workspace…
              </div>
            </div>
          )}

          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role}>
                {m.role === "assistant" && (m.hits || m.context) ? (
                  <AnswerBlock
                    text={m.content}
                    hits={m.hits}
                    context={m.context}
                    debug={{
                      provider,
                      hits_count: Array.isArray(m.hits) ? m.hits.length : 0,
                      top_k: 6,
                    }}
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {m.content}
                  </div>
                )}
              </MessageBubble>
            ))}
          </div>
        </main>

        {/* Toast */}
        {toast && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-28 z-20">
            <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm text-white">
              {toast}
            </div>
          </div>
        )}

        {/* Composer */}
        <footer className="border-t border-white/10 p-3 bg-white/5">
          <div className="mx-auto max-w-3xl">
            {/* selected files preview */}
            {files.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-xs text-white"
                  >
                    {f.name}
                    <button
                      className="rounded hover:bg-white/10"
                      title="Supprimer"
                      onClick={() => removeFileAt(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className="rounded-lg px-3 py-1.5 hover:bg-white/10"
                title="Joindre des fichiers"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                  const list = Array.from(e.target.files || []);
                  if (list.length) {
                    doUpload(list);
                    setFiles((prev) => [...prev, ...list]);
                    e.target.value = "";
                  }
                }}
              />

              <input
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-brand/40 placeholder:text-white/50 text-white [color-scheme:dark]"
                placeholder="Posez une question…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              />

              <button
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium text-black bg-orange-brand hover:brightness-110 disabled:opacity-50"
                onClick={send}
                disabled={busy || !q.trim()}
              >
                Envoyer
              </button>
            </div>

            <div className="text-[11px] text-white/60 mt-2">
              Source :{" "}
              <b>{sourceMode === "workspace" ? "Workspace" : "Global"}</b>
              {" · "}LLM : <b>{provider}</b>
              {sourceMode === "workspace" && !workspaceId
                ? " — (aucun workspace actif)"
                : ""}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
