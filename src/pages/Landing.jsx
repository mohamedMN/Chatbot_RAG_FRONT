import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Shield,
  Upload,
  ChevronRight,
  FolderKanban,
  BookOpen,
} from "lucide-react";

// --- Constants (JS only, no TypeScript) ---
const CATEGORIES = ["Général", "API", "ESB", "Events"];
const RECENTS = [
  "Exposer service REST",
  "Connecteur SAP IDoc",
  "Policy OAuth2",
  "JMS Trigger (UM)",
];

export default function Landing() {
  const [tab, setTab] = useState("Général");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const features = useMemo(
    () => [
      {
        icon: <Sparkles className="h-5 w-5" aria-hidden />,
        title: "RAG contextuel",
        desc: "Réponses ancrées dans vos documents indexés (FAISS, embeddings).",
      },
      {
        icon: <MessageSquare className="h-5 w-5" aria-hidden />,
        title: "Chat naturel",
        desc: "Posez des questions en français technique, suivez les citations.",
      },
      {
        icon: <Shield className="h-5 w-5" aria-hidden />,
        title: "Sécurité simple",
        desc: "Espace admin protégé, sandboxes éphémères par workspace.",
      },
      {
        icon: <Upload className="h-5 w-5" aria-hidden />,
        title: "Glisser-déposer",
        desc: "Ajoutez un PDF/DOCX dans le chat, indexation automatique.",
      },
    ],
    []
  );

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0b0f14] via-[#0b0f14] to-[#0e1218] text-white">
      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/5 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setSidebarOpen((s) => !s)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-brand" />
            <span className="font-semibold">Orange Business</span>
          </div>
          <Link
            to="/login"
            className="hidden xs:inline-flex h-9 items-center rounded-xl border border-white/15 px-3 text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 px-4 md:px-6 py-6">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block md:sticky md:top-6 h-fit rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4`}
        >
          <div className="hidden md:flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-orange-brand" />
            <div className="font-semibold">Orange Business</div>
          </div>

          <div className="text-xs text-white/60 uppercase tracking-wide mb-2">
            Catégories
          </div>
          <nav className="grid gap-2" aria-label="Catégories">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setTab(c)}
                className={`group text-left rounded-xl px-3 py-2 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  tab === c ? "bg-white/10 ring-1 ring-white/10" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-white/60 group-hover:text-white/80" />
                  {c}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-6 text-xs text-white/60 uppercase tracking-wide mb-2">
            Discussions récentes
          </div>
          <ul className="text-sm text-white/80 space-y-1">
            {RECENTS.map((r) => (
              <li key={r} className="truncate">
                <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                  {r}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              to="/chat"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-brand px-4 py-2.5 font-medium text-black shadow-[0_8px_20px_-8px_rgba(255,140,0,0.6)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              Ouvrir le chat <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main>
          {/* Header (desktop) */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-brand" />
              <div className="text-xl font-semibold">Assistant webMethods</div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/chat"
                className="h-10 inline-flex items-center rounded-xl border border-white/15 px-4 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                Open Chat
              </Link>
              <Link
                to="/login"
                className="h-10 inline-flex items-center rounded-xl bg-orange-brand px-4 font-medium text-black shadow-[0_8px_20px_-8px_rgba(255,140,0,0.6)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                Admin
              </Link>
            </div>
          </div>

          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
            <GradientOrbs />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Posez vos questions{" "}
                <span className="text-orange-brand">webMethods</span>
              </h1>
              <p className="mt-3 text-white/70">
                Déposez un document dans le chat — l'indexation RAG s'occupe du
                reste.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-brand px-5 py-3 font-semibold text-black shadow-[0_10px_24px_-10px_rgba(255,140,0,0.8)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  onClick={() => navigate("/chat")}
                >
                  Commencer <ChevronRight className="h-4 w-4" />
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  Accéder à l'Admin
                </Link>
              </div>
            </motion.div>
          </section>

          {/* Feature grid */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:border-white/20"
              >
                <div className="flex items-center gap-2 text-white/90">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  {f.desc}
                </p>
              </motion.article>
            ))}
          </section>

          {/* Category tips */}
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <header className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-white/70" />
              <span className="text-sm uppercase tracking-wide text-white/60">
                Exemples — {tab}
              </span>
            </header>
            <div className="grid gap-2 sm:grid-cols-2">
              {getSamples(tab).map((s) => (
                <button
                  key={s}
                  onClick={() => navigate("/chat", { state: { prompt: s } })}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:border-white/20"
                >
                  <span className="text-white/85">{s}</span>
                  <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/70" />
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function GradientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  );
}

// JS version (no types)
function getSamples(tab) {
  switch (tab) {
    case "API":
      return [
        "Créer une API REST dans IS",
        "Configurer OAuth2 (Authorization Code)",
        "Gérer les erreurs et les timeouts",
      ];
    case "ESB":
      return [
        "Pattern pub/sub avec UM",
        "Déployer un package IS",
        "Lire un message JMS et transformer en XML",
      ];
    case "Events":
      return [
        "Définir un Trigger Document",
        "Configurer un Scheduler",
        "Traiter un flux Kafka",
      ];
    default:
      return [
        "Décris webMethods Integration Server",
        "Quelles bonnes pratiques de versionning de packages ?",
        "Comment monitorer les services critiques ?",
      ];
  }
}
