import React from "react";
export default function TopTabs({ tabs, active, onChange }) {
  return (
    <div className="mx-auto flex items-center justify-center gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange?.(t)}
          className={`rounded-full px-4 py-2 text-sm border ${
            active === t ? "bg-white text-black" : "bg-white/5 text-white"
          } border-white/10`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
