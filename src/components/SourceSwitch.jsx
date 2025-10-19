// src/components/SourceSwitch.jsx
import React from "react";

export default function SourceSwitch({ mode, setMode, disabled }) {
  const opt = (value, label) => {
    const active = mode === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setMode(value)}
        disabled={disabled && value === "workspace"}
        className={[
          "px-3 py-1.5 text-sm rounded-lg border transition",
          active
            ? "bg-orange-brand text-black border-orange-brand"
            : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10",
          disabled && value === "workspace" ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
        title={value === "workspace" && disabled ? "Create/ensure a workspace first" : ""}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="inline-flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
      {opt("workspace", "Workspace")}
      {opt("global", "Global")}
    </div>
  );
}
