// src/pages/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  ask,
  uploadDoc,
  createWorkspace,
  buildWorkspace,
} from "../services/api.js";
import { useAuth } from "../state/AuthContext.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatHeader from "../components/ChatHeader.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import {
  Paperclip,
  Mic,
  Trash2,
  Loader2,
  FolderPlus,
  Wrench,
} from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const [model, setModel] = useState("Standard");
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour 👋 AI Chat est un assistant pour vos questions webMethods.\nCréez un workspace, uploadez un document (PDF/DOCX/TXT), puis posez votre question.",
    },
  ]);
  const [history, setHistory] = useState([]);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  // ----- helpers -----
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

  // ----- ask/send -----
  async function send() {
    if (!q.trim()) return;
    const userMsg = { role: "user", content: q };
    setMessages((m) => [...m, userMsg]);
    setQ("");
    try {
      const r = await ask(
        q,
        { k: 6, min_score: 0.3, include_context: true },
        workspaceId
      );
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: r.answer,
          context: r.context,
          hits: r.hits,
        },
      ]);
    } catch (e) {
      pushError(e?.message || "Erreur d’appel /ask");
    }
  }

  // ----- file attach (picker) -----
  function onPickFiles(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]);
  }
  function removeFileAt(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ----- DnD -----
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
    if (!workspaceId) {
      showToast("Créez un workspace d’abord.");
      pushAssistant(
        "ℹ️ Aucun workspace. Cliquez sur « Nouveau workspace » puis réessayez."
      );
      return;
    }
    for (const file of list) {
      pushAssistant(`📄 Import de ${file.name}…`);
      try {
        const res = await uploadDoc(file, workspaceId);
        pushAssistant(`✅ Document reçu (${res?.filename ?? file.name}).`);
      } catch (err) {
        pushError(`Import échoué: ${err?.message || "échec réseau"}`);
      }
    }
  }

  // ----- workspace actions -----
  async function doCreateWorkspace() {
    try {
      setBusy(true);
      const w = await createWorkspace(); // { ws_id }
      setWorkspaceId(w.ws_id);
      showToast(`Workspace créé: ${w.ws_id}`);
      pushAssistant(
        `🧪 Workspace **${w.ws_id}** créé. Uploadez vos documents puis « Rebuild index ».`
      );
    } catch (e) {
      pushError(e?.message || "Impossible de créer un workspace");
    } finally {
      setBusy(false);
    }
  }

  async function doBuildWorkspace() {
    if (!workspaceId) {
      showToast("Créez un workspace d’abord.");
      return;
    }
    try {
      setBusy(true);
      const r = await buildWorkspace(workspaceId);
      showToast("Index reconstruit.");
      pushAssistant(
        `🔧 Index reconstruit pour **${workspaceId}** — chunks: ${
          r?.stats?.total_chunks ?? "?"
        }, vecteurs: ${r?.stats?.total_vectors ?? "?"}.`
      );
    } catch (e) {
      pushError(e?.message || "Échec rebuild index");
    } finally {
      setBusy(false);
    }
  }

  // ----- history -----
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
      },
    ]);
    setMessages([
      {
        role: "assistant",
        content:
          "Nouveau chat. Posez une question ou joignez un document pour l’indexer (workspace requis).",
      },
    ]);
  }
  function openChat(h) {
    setMessages(h.snapshot);
  }
  function deleteAll() {
    setHistory([]);
  }

  return (
    <div className="min-h-dvh flex relative bg-gradient-to-b from-[#0b0f14] via-[#0b0f14] to-[#0e1218] text-white">
      {/* Left Sidebar */}
      <ChatSidebar
        history={history}
        onNew={newChat}
        onSelect={openChat}
        onDeleteAll={deleteAll}
      />

      {/* Right – Chat area */}
      <div
        className="flex-1 grid grid-rows-[auto_auto_1fr_auto] relative"
        ref={dropRef}
      >
        {/* Top header (model) */}
        <ChatHeader model={model} setModel={setModel} />

        {/* Workspace bar */}
        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10 disabled:opacity-50"
            onClick={doCreateWorkspace}
            disabled={busy}
            title="Copie base → workspace"
          >
            <FolderPlus className="h-4 w-4" />
            Nouveau workspace
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10 disabled:opacity-50"
            onClick={doBuildWorkspace}
            disabled={busy || !workspaceId}
            title="Reconstruire FAISS pour ce workspace"
          >
            <Wrench className="h-4 w-4" />
            Rebuild index
          </button>

          <div className="ml-auto text-xs text-white/70">
            {busy && <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />}
            Workspace:{" "}
            <span className="font-mono text-white/90">
              {workspaceId || "—"}
            </span>
          </div>
        </div>

        {/* Messages */}
        <main className="overflow-y-auto p-6 relative">
          {/* DnD overlay */}
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
                {m.content}
                {m.context && (
                  <details className="mt-2 text-xs opacity-80">
                    <summary>Contexte</summary>
                    <pre className="whitespace-pre-wrap">{m.context}</pre>
                  </details>
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
                    setFiles((prev) => [...prev, ...list]);
                    // Upload immediately
                    doUpload(list);
                    e.target.value = "";
                  }
                }}
              />

              <input
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-brand/40 placeholder:text-white/50 text-white [color-scheme:dark]"
                placeholder="Posez une question…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />

              <button
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium text-black bg-orange-brand hover:brightness-110"
                onClick={send}
                disabled={busy}
              >
                Envoyer
              </button>

              <button
                className="rounded-lg px-3 py-1.5 hover:bg-white/10"
                title="Mic (placeholder)"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            <div className="text-[11px] text-white/60 mt-2">
              Astuce: créez un workspace, uploadez vos docs, « Rebuild index »,
              puis posez votre question.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
