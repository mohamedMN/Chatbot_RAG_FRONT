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
import { Trash2, Search, ExternalLink } from "lucide-react";

const KEYS = ["rag_chat_history", "chat_history", "history"];

/** Try to read history from localStorage under known keys */
function readLocalHistory() {
  for (const k of KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return { key: k, items: arr };
    } catch {}
  }
  return { key: KEYS[0], items: [] };
}

/** Write history back to the same key we loaded */
function writeLocalHistory(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

/** Normalize item shape so UI can render robustly */
function normalizeItem(it) {
  // expected shape from your Chat.jsx newChat():
  // { id, title, subtitle, snapshot: [ {role, content, ...}, ... ] }
  if (!it) return null;
  const id = it.id || crypto.randomUUID();
  const title =
    it.title ||
    (Array.isArray(it.snapshot)
      ? it.snapshot.find((m) => m.role === "user")?.content?.slice(0, 40) ||
        "Conversation"
      : "Conversation");
  const subtitle = it.subtitle || it.ts || new Date().toLocaleString();
  const snapshot = Array.isArray(it.snapshot) ? it.snapshot : [];
  return { id, title, subtitle, snapshot };
}

export default function HistoryPage() {
  const { user, logout } = useAuth();

  const [{ key: storageKey, items: rawItems }, setRaw] = useState(() =>
    readLocalHistory()
  );
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const items = useMemo(
    () => rawItems.map(normalizeItem).filter(Boolean),
    [rawItems]
  );
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter(
      (it) =>
        it.title?.toLowerCase()?.includes(s) ||
        it.subtitle?.toLowerCase()?.includes(s)
    );
  }, [items, q]);

  useEffect(() => {
    // initial load (already done via lazy init), emulate loading skeleton briefly
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  function removeOne(id) {
    const next = rawItems.filter(
      (it) => (it.id || "").toString() !== id.toString()
    );
    setRaw({ key: storageKey, items: next });
    writeLocalHistory(storageKey, next);
    if (selected?.id === id) setSelected(null);
  }

  function clearAll() {
    setRaw({ key: storageKey, items: [] });
    writeLocalHistory(storageKey, []);
    setSelected(null);
    setConfirmClear(false);
  }

  function openInChat(it) {
    // Pass snapshot to Chat via sessionStorage, Chat can pick it up on mount.
    try {
      sessionStorage.setItem(
        "chat_restore_snapshot",
        JSON.stringify(it.snapshot || [])
      );
    } catch {}
    // navigate
    window.location.href = "/chat";
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-dvh grid place-items-center text-white/80">
        Accès refusé — administrateur requis.
      </div>
    );
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
        <section className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Card className="border-white/10 bg-white/5 backdrop-blur text-white md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <Input
                    placeholder="Rechercher par titre ou date…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/50"
                  />
                </div>

                <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Tout supprimer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Vider l’historique ?</DialogTitle>
                      <DialogDescription>
                        Action irréversible (localStorage).
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-end">
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button onClick={clearAll} variant="destructive">
                        Confirmer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* List + Preview */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* List */}
          <Card className="border-white/10 bg-white/5 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">
                Conversations
              </CardTitle>
              <CardDescription className="hidden" />
            </CardHeader>
            <CardContent className="min-h-[480px] max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full bg-white/10" />
                  <Skeleton className="h-14 w-full bg-white/10" />
                  <Skeleton className="h-14 w-full bg-white/10" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-white/60">
                  Aucune conversation.
                </div>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((it) => {
                    const count = it.snapshot?.length ?? 0;
                    return (
                      <li
                        key={it.id}
                        className={`rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition ${
                          selected?.id === it.id ? "ring-1 ring-white/20" : ""
                        }`}
                      >
                        <button
                          className="w-full text-left"
                          onClick={() => setSelected(it)}
                          title={it.title}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {it.title}
                              </div>
                              <div className="text-xs text-white/60 truncate">
                                {it.subtitle}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-white/10 border-white/10"
                            >
                              {count} msg
                            </Badge>
                          </div>
                        </button>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-8 bg-orange-brand text-black hover:brightness-110"
                            onClick={() => openInChat(it)}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-2" />
                            Ouvrir dans Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-500/40 text-red-300 hover:bg-red-500/10"
                            onClick={() => removeOne(it.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-white/10 bg-white/5 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Aperçu</CardTitle>
              <CardDescription className="hidden" />
            </CardHeader>
            <CardContent className="min-h-[480px] max-h-[60vh] overflow-y-auto">
              {!selected ? (
                <div className="text-sm text-white/60">
                  Sélectionnez une conversation à gauche.
                </div>
              ) : selected.snapshot?.length ? (
                <div className="space-y-3">
                  {selected.snapshot.map((m, i) => (
                    <MessageBubble key={i} role={m.role}>
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
