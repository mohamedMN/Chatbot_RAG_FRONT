import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";

import {
  getStats,
  getAdminConfig,
  adminReindex,
  adminFlushIndex,
} from "../services/api.js";

// shadcn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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

// icons
import { Info, Loader2, RefreshCw, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [confirmReindexOpen, setConfirmReindexOpen] = useState(false);
  const [confirmFlushOpen, setConfirmFlushOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingStats(true);
        setError("");
        const s = await getStats();
        setStats(s);
      } catch (e) {
        setError(e?.message || "Impossible de charger les statistiques.");
      } finally {
        setLoadingStats(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingConfig(true);
        const c = await getAdminConfig();
        setConfig(c?.config || c || null);
      } finally {
        setLoadingConfig(false);
      }
    })();
  }, []);

  async function onReindex() {
    setBusy(true);
    setError("");
    try {
      await adminReindex();
      const s = await getStats();
      setStats(s);
    } catch (e) {
      setError(e?.message || "Échec de la reconstruction.");
    } finally {
      setBusy(false);
      setConfirmReindexOpen(false);
    }
  }

  async function onFlush() {
    setBusy(true);
    setError("");
    try {
      await adminFlushIndex();
      const s = await getStats();
      setStats(s);
    } catch (e) {
      setError(e?.message || "Échec de la suppression.");
    } finally {
      setBusy(false);
      setConfirmFlushOpen(false);
    }
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
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Tableau de bord</h1>
          <div
            className="text-xs text-white/60 truncate max-w-[50%]"
            title={user?.email}
          >
            {user?.email}
          </div>
        </div>

        {/* Top row */}
        <section className="grid gap-6 md:grid-cols-4">
          {/* Utilisateur (overflow fixed) */}
          <GlassCard title="Utilisateur">
            <div className="min-w-0">
              <div
                className="text-2xl font-semibold break-words leading-tight truncate"
                title={user?.email}
              >
                {user?.email}
              </div>
              <div className="text-white/70 text-sm mt-1">
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Conversations (24h)">
            {loadingStats ? (
              <Skeleton className="h-8 w-24 bg-white/10" />
            ) : (
              <>
                <div className="text-3xl font-extrabold">
                  {stats?.conversations_24h ?? "—"}
                </div>
                <div className="text-xs text-white/60">
                  vs veille: {stats?.delta_24h ?? "—"}%
                </div>
              </>
            )}
          </GlassCard>

          <GlassCard title="Docs indexés">
            {loadingStats ? (
              <Skeleton className="h-8 w-24 bg-white/10" />
            ) : (
              <>
                <div className="text-3xl font-extrabold">
                  {stats?.indexed_total ?? stats?.documents_total ?? "—"}
                </div>
                <div className="text-xs text-white/60">
                  Nouveaux 7j: {stats?.indexed_7d ?? stats?.documents_7d ?? "—"}
                </div>
              </>
            )}
          </GlassCard>

          <GlassCard title="Uploads (fichiers)">
            {loadingStats ? (
              <Skeleton className="h-8 w-24 bg-white/10" />
            ) : (
              <>
                <div className="text-3xl font-extrabold">
                  {stats?.uploads_total ?? "—"}
                </div>
                <div className="text-xs text-white/60">
                  7 derniers jours: {stats?.uploads_7d ?? "—"}
                </div>
              </>
            )}
          </GlassCard>

          {/* Total Messages */}
          <GlassCard
            title={
              <div className="flex items-center gap-2">
                <span>Total Messages (24h)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="opacity-80 hover:opacity-100">
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      The total message indicates the number of messages sent
                      and received during a session. (Agrégé sur les 24
                      dernières heures)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            }
          >
            {loadingStats ? (
              <Skeleton className="h-8 w-24 bg-white/10" />
            ) : (
              <div className="text-3xl font-extrabold">
                {stats?.total_messages_24h ?? "—"}
              </div>
            )}
            <p className="text-xs text-white/60 mt-1">Utilisateur </p>
          </GlassCard>
        </section>

        {/* Maintenance */}
        <section className="grid gap-6 md:grid-cols-3">
          <GlassCard title="Maintenance">
            <div className="grid gap-3">
              {/* Rebuild */}
              <Dialog
                open={confirmReindexOpen}
                onOpenChange={setConfirmReindexOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={busy}
                    className="bg-orange-brand text-black hover:brightness-110"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        En cours…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Rebuild index
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reconstruire l’index ?</DialogTitle>
                    <DialogDescription>
                      L’opération peut prendre plusieurs minutes.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:justify-end">
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button onClick={onReindex} disabled={busy}>
                      Confirmer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Flush */}
              <Dialog
                open={confirmFlushOpen}
                onOpenChange={setConfirmFlushOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={busy}
                    className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Flush index
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Supprimer les artefacts d’index ?</DialogTitle>
                    <DialogDescription>
                      Action <b>irréversible</b>. Assurez-vous d’avoir une
                      sauvegarde.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:justify-end">
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button
                      onClick={onFlush}
                      variant="destructive"
                      disabled={busy}
                    >
                      Confirmer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </GlassCard>
        </section>

        <Separator className="bg-white/10" />
        <footer className="pb-8 pt-2 text-xs text-white/50">
          Orange · webMethods — Dashboard administrateur
        </footer>
      </main>
    </div>
  );
}

/* ---------- UI helpers ---------- */
function GlassCard({ title, children, className = "" }) {
  return (
    <Card
      className={`border-white/10 bg-white/5 backdrop-blur text-white shadow-[0_15px_40px_-20px_rgba(0,0,0,0.6)] overflow-hidden ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white/80 truncate">
          {title}
        </CardTitle>
        <CardDescription className="hidden" />
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}

function KV({ k, v, mono = false }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="w-48 shrink-0 text-white/60">{k}</span>
      <span
        className={`break-words ${mono ? "font-mono" : ""}`}
        title={String(v ?? "—")}
      >
        {v ?? "—"}
      </span>
    </div>
  );
}
