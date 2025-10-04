import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { getStats, adminReindex, adminFlushIndex } from "../services/api.js";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const s = await getStats();
        setStats(s);
      } catch (e) {
        setError(e?.message || "Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onReindex() {
    if (!confirm("Reconstruire l’index ? Cela peut prendre du temps.")) return;
    setBusy(true);
    setError("");
    try {
      await adminReindex();
      // Optionally refetch stats:
      const s = await getStats();
      setStats(s);
    } catch (e) {
      setError(e?.message || "Échec de la reconstruction.");
    } finally {
      setBusy(false);
    }
  }

  async function onFlush() {
    if (!confirm("Supprimer les artefacts d’index ? Action irréversible."))
      return;
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
    }
  }

  // Optional guard (you can also wrap route with <RequireAdmin/>)
  if (user?.role !== "admin") {
    return (
      <div className="min-h-dvh grid place-items-center text-white/80">
        Accès refusé — administrateur requis.
      </div>
    );
  }
function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.6)]">
      <div className="text-sm text-white/70 mb-1">{title}</div>
      {children}
    </div>
  );
}
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0b0f14] via-[#0b0f14] to-[#0e1218] text-white">
      {/* Header */}
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-orange-brand" />
          <div className="font-semibold">Tableau de bord</div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/chat" className="rounded-lg px-3 py-1.5 hover:bg-white/10">
            Chat
          </Link>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10"
            onClick={logout}
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Top row */}
      <section className="mx-auto max-w-6xl px-4 grid gap-6 md:grid-cols-3">
        <Card title="Utilisateur">
          <div className="text-2xl font-semibold">{user?.email}</div>
          <div className="text-white/70 text-sm">
            {user?.role?.toUpperCase()}
          </div>
        </Card>

        <Card title="Conversations (24h)">
          <div className="text-3xl font-extrabold">
            {stats?.conversations_24h ?? "—"}
          </div>
          <div className="text-xs text-white/60">
            vs veille: {stats?.delta_24h ?? "—"}%
          </div>
        </Card>

        <Card title="Docs indexés">
          <div className="text-3xl font-extrabold">
            {stats?.documents_total ?? "—"}
          </div>
          <div className="text-xs text-white/60">
            Nouveaux 7j: {stats?.documents_7d ?? "—"}
          </div>
        </Card>
      </section>

      {/* Quality + actions */}
      <section className="mx-auto max-w-6xl px-4 grid gap-6 md:grid-cols-3 mt-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <h2 className="text-lg font-semibold mb-2">Qualité du chatbot</h2>
          <ul className="text-sm list-disc pl-6 space-y-1 text-white/80">
            <li>Top-K moyen: {stats?.retrieval_topk_avg ?? "—"}</li>
            <li>
              Similarité moyenne: {stats?.similarity_avg?.toFixed?.(3) ?? "—"}
            </li>
            <li>Temps moyen réponse (ms): {stats?.latency_ms_avg ?? "—"}</li>
            <li>Taux réponses “sûres”: {stats?.safe_answer_rate ?? "—"}%</li>
          </ul>
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <h2 className="text-lg font-semibold mb-3">Maintenance</h2>
          <div className="grid gap-2">
            <button
              onClick={onReindex}
              disabled={busy}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-black ${
                busy
                  ? "bg-orange-400/50 cursor-not-allowed"
                  : "bg-orange-brand hover:brightness-110"
              }`}
            >
              Rebuild index
            </button>
            <button
              onClick={onFlush}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium border border-red-500/40 text-red-300 hover:bg-red-500/10"
            >
              Flush index
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

