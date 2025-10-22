// src/components/AnswerBlock.jsx
import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "text-slate-300 border-slate-700/50 bg-slate-800/40",
    green: "text-emerald-300 border-emerald-600/40 bg-emerald-500/10",
    orange: "text-orange-300 border-orange-600/40 bg-orange-500/10",
    purple: "text-purple-300 border-purple-600/40 bg-purple-500/10",
    yellow: "text-yellow-300 border-yellow-600/40 bg-yellow-500/10",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded border ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SourceChip({ idx, onClick }) {
  return (
    <button
      onClick={() => onClick?.(idx)}
      className="text-xs rounded px-2 py-0.5 border border-white/15 bg-white/5 hover:bg-white/10 text-white/80"
      title={`Voir l’extrait de la source #${idx}`}
    >
      #{idx}
    </button>
  );
}

export default function AnswerBlock({
  text = "",
  hits = [],
  context = "",
  debug = null,  // {provider,llm_ready,last_error,hits_count,...}
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSrc, setSelectedSrc] = useState(null);
  const [copied, setCopied] = useState(false);

  const sources = useMemo(() => {
    return (hits || []).map((h, i) => ({
      n: i + 1,
      subject: h.subject || "Information",
      source: (h.source || "document").split("\\").pop().split("/").pop(),
      content: h.content || "",
      score: typeof h.score === "number" ? h.score : null,
    }));
  }, [hits]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <span className="text-xs text-white/70">Réponse</span>
        <div className="ml-auto flex items-center gap-2">
          {debug?.provider && <Badge tone="orange">LLM: {debug.provider}</Badge>}
          {typeof debug?.hits_count === "number" && (
            <Badge tone="green">hits: {debug.hits_count}</Badge>
          )}
          {debug?.top_k && <Badge>top-k: {debug.top_k}</Badge>}
          <button
            onClick={copy}
            className="text-xs rounded px-2 py-1 border border-white/15 bg-white/5 hover:bg-white/10 text-white/80"
            title="Copier la réponse"
          >
            {copied ? "Copié ✓" : "Copier"}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs rounded px-2 py-1 border border-white/15 bg-white/5 hover:bg-white/10 text-white/80"
            title={expanded ? "Réduire" : "Développer"}
          >
            {expanded ? "Réduire" : "Développer"}
          </button>
        </div>
      </div>

      {/* Body (markdown) */}
      <div className="prose prose-invert max-w-none px-4 py-3 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-code:text-white">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {text || "_(pas de texte)_"}
        </ReactMarkdown>
      </div>

      {/* Sources quick chips (detect [#n] in text) */}
      {sources?.length > 0 && (
        <div className="px-4 pb-3">
          <div className="text-xs text-white/60 mb-1">Citations</div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <SourceChip key={s.n} idx={s.n} onClick={setSelectedSrc} />
            ))}
          </div>
        </div>
      )}

      {/* Expand: sources list + context toggle */}
      <div className={`${expanded ? "block" : "hidden"} border-t border-white/10`}>
        {/* Sources list */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-white/80">Sources utilisées</h4>
          </div>
          <ul className="space-y-2">
            {sources.map((s) => (
              <li
                key={s.n}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-semibold text-white/90">#{s.n}</span>{" "}
                    <span className="text-white/80">{s.subject}</span>{" "}
                    <span className="text-white/50">— {s.source}</span>
                  </div>
                  {typeof s.score === "number" && (
                    <Badge tone="purple">sim: {s.score.toFixed(2)}</Badge>
                  )}
                </div>
                {s.content && (
                  <p className="mt-2 text-sm text-white/80 line-clamp-4">
                    {s.content}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Optional: raw context (for debugging) */}
        {context && (
          <div className="px-4 pb-4">
            <details className="text-xs opacity-80">
              <summary className="cursor-pointer select-none">
                Contexte brut envoyé au LLM
              </summary>
              <pre className="whitespace-pre-wrap mt-2 rounded-lg border border-white/10 bg-black/30 p-3 text-white/80 text-[12px] max-h-64 overflow-auto">
                {context}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Modal snippet for a selected source */}
      {selectedSrc != null && sources[selectedSrc - 1] && (
        <div
          className="fixed inset-0 z-40 bg-black/50 grid place-items-center p-4"
          onClick={() => setSelectedSrc(null)}
        >
          <div
            className="max-w-2xl w-full rounded-xl bg-[#131722] border border-white/15 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="text-sm text-white/80">
                Source #{selectedSrc} — {sources[selectedSrc - 1]?.source}
              </div>
              <button
                onClick={() => setSelectedSrc(null)}
                className="text-xs rounded px-2 py-1 border border-white/15 bg-white/5 hover:bg-white/10 text-white/80"
              >
                Fermer
              </button>
            </div>
            <div className="p-4">
              <div className="text-sm text-white/90 font-medium mb-2">
                {sources[selectedSrc - 1]?.subject}
              </div>
              <div className="text-sm text-white/80 whitespace-pre-wrap max-h-96 overflow-auto">
                {sources[selectedSrc - 1]?.content || "(vide)"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
