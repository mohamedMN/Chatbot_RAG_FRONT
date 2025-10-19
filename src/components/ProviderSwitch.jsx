// src/components/ProviderSwitch.jsx
import React from "react";

/**
 * props:
 * - value: "ollama" | "groq"
 * - onChange: (next) => void
 * - disabled?: boolean
 * - ready?: boolean | null  // optional readiness indicator from server
 */
export default function ProviderSwitch({ value, onChange, disabled, ready }) {
  const btn = (id, label) => {
    const active = value === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onChange(id)}
        disabled={disabled}
        className={[
          "px-3 py-1.5 text-sm rounded-lg border transition",
          active
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
        {btn("ollama", "Local (Ollama)")}
        {btn("groq", "Cloud (Groq)")}
      </div>
      {typeof ready === "boolean" && (
        <span
          className={[
            "text-xs rounded px-2 py-0.5 border",
            ready
              ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
              : "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
          ].join(" ")}
          title={ready ? "Provider ready" : "Provider not ready"}
        >
          {ready ? "ready" : "not ready"}
        </span>
      )}
    </div>
  );
}
