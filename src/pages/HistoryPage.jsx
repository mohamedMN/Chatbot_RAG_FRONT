// src/pages/HistoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";
import MessageBubble from "../components/MessageBubble.jsx";

// shadcn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// icons
import { Trash2, Search, ExternalLink, RefreshCw } from "lucide-react";

// API services
import { getMySessions, getMessagesBySession } from "@/services/api";

// ---- helpers ----
function fmtDate(s) {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s || "";
  }
}

export default function HistoryPage() {
  const { user, logout } = useAuth();

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);

  // Search in sessions
  const [q, setQ] = useState("");

  // Selected session + messages
  const [selected, setSelected] = useState(null); // { id, started_at, ... }
  const [msgs, setMsgs] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [msgsError, setMsgsError] = useState(null);

  // Clear history confirm (optional UI — only clears local preview, NOT DB)
  const [confirmClear, setConfirmClear] = useState(false);

  // Guard: admin only (keep your rule)
  if (user?.role !== "admin") {
    return (
      <div className="min-h-dvh grid place-items-center text-white/80">
        Accès refusé — administrateur requis.
      </div>
    );
  }

  // Load sessions once
  function loadSessions() {
    setSessionsLoading(true);
    setSessionsError(null);
    getMySessions({ limit: 500 })
      .then((rows) => setSessions(rows || []))
      .catch((e) => setSessionsError(e?.message || "Failed to load sessions"))
      .finally(() => setSessionsLoading(false));
  }

  useEffect(() => {
    loadSessions();
  }, []);

  // Filter sessions by search
  const filtered = useMemo(() => {
    if (!q.trim()) return sessions;
    const s = q.toLowerCase();
    return sessions.filter(
      (it) =>
        it.id?.toLowerCase().includes(s) ||
        fmtDate(it.started_at).toLowerCase().includes(s) ||
        (it.email || "").toLowerCase().includes(s)
    );
  }, [sessions, q]);

  // Load messages when a session is selected
  useEffect(() => {
    if (!selected?.id) {
      setMsgs([]);
      setMsgsError(null);
      return;
    }
    let alive = true;
    setMsgsLoading(true);
    setMsgsError(null);
    setMsgs([]);

    getMessagesBySession(selected.id, { limit: 2000 })
      .then((rows) => {
        if (!alive) return;
        setMsgs(rows || []);
      })
      .catch((e) => {
        if (!alive) return;
        setMsgsError(e?.message || "Failed to load messages");
      })
      .finally(() => {
        if (!alive) return;
        setMsgsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selected?.id]);

  // Optional “open in Chat” — passes the transcript to sessionStorage so your Chat page can restore it
  function openInChat() {
    try {
      const snapshot = (msgs || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      sessionStorage.setItem("chat_restore_snapshot", JSON.stringify(snapshot));
    } catch {}
    window.location.href = "/chat";
  }

  // Optional “clear” only clears what you see locally (does NOT delete DB)
  function clearLocal() {
    setSelected(null);
    setMsgs([]);
    setMsgsError(null);
    setConfirmClear(false);
  }

  return (
    <div className="min-h-dvh grid grid-cols-[260px_1fr] bg-gradient-to-b from-[#0b0f14] via-[#0b0f14] to-[#0e1218] text-white">
      {/* LEFT NAV */}
      <AdminSidebar onLogout={logout} />

      {/* RIGHT CONTENT */}
      <main className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            Historique des conversations
          </h1>
          <div
            className="text-xs text-white/60 truncate max-w-[50%]"
            title={user?.email}
          >
            {user?.email}
          </div>
        </div>

        {/* Search + actions */}
        <section className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Card className="border-white/10 bg-white/5 backdrop-blur text-white md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <Input
                    placeholder="Rechercher par ID, date ou email…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={loadSessions}
            className="h-[52px] md:self-stretch bg-black text-white border border-black hover:bg-black/80 hover:text-white"
            title="Rafraîchir la liste des sessions"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
          <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
            <DialogTrigger asChild>
              <Button
                className="h-[52px] md:self-stretch bg-black text-white border border-black hover:bg-black/80 hover:text-white"
                title="Effacer la sélection locale"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Vider la sélection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Vider la sélection locale ?</DialogTitle>
                <DialogDescription>
                  Ça ne supprime rien en base. Ça efface juste la sélection et
                  les messages affichés.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button onClick={clearLocal} variant="destructive">
                  Confirmer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        {/* List + Preview */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Sessions list */}
          <Card className="border-white/10 bg-white/5 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Sessions</CardTitle>
              <CardDescription className="hidden" />
            </CardHeader>
            <CardContent className="min-h-[480px] max-h-[60vh] overflow-y-auto">
              {sessionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full bg-white/10" />
                  <Skeleton className="h-14 w-full bg-white/10" />
                  <Skeleton className="h-14 w-full bg-white/10" />
                </div>
              ) : sessionsError ? (
                <div className="text-sm text-red-300">{sessionsError}</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-white/60">Aucune session.</div>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((it) => {
                    const active = selected?.id === it.id;
                    return (
                      <li
                        key={it.id}
                        className={`rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition ${
                          active ? "ring-1 ring-white/20" : ""
                        }`}
                      >
                        <button
                          className="w-full text-left"
                          onClick={() => setSelected(it)}
                          title={it.id}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {it.email || "Session"}
                              </div>
                              <div className="text-xs text-white/60 truncate">
                                {fmtDate(it.started_at)} · {it.id}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-white/10 border-white/10"
                            >
                              ID
                            </Badge>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Messages preview */}
          <Card className="border-white/10 bg-white/5 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white/80">
                  Messages
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selected?.id ? (
                    <Button
                      size="sm"
                      className="h-8 bg-orange-brand text-black hover:brightness-110"
                      onClick={openInChat}
                      title="Ouvrir cette conversation dans Chat"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Ouvrir dans Chat
                    </Button>
                  ) : null}
                </div>
              </div>
              <CardDescription className="hidden" />
            </CardHeader>
            <CardContent className="min-h-[480px] max-h-[60vh] overflow-y-auto">
              {!selected ? (
                <div className="text-sm text-white/60">
                  Sélectionnez une session à gauche.
                </div>
              ) : msgsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full bg-white/10" />
                  <Skeleton className="h-14 w-full bg-white/10" />
                  <Skeleton className="h-14 w-full bg-white/10" />
                </div>
              ) : msgsError ? (
                <div className="text-sm text-red-300">{msgsError}</div>
              ) : msgs.length ? (
                <div className="space-y-3">
                  {msgs.map((m) => (
                    <MessageBubble key={m.id} role={m.role}>
                      {m.content}
                    </MessageBubble>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/60">Conversation vide.</div>
              )}
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-white/10" />
        <footer className="pb-8 pt-2 text-xs text-white/50">
          Orange · webMethods — Historique
        </footer>
      </main>
    </div>
  );
}
