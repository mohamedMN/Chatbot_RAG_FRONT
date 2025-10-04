import React from "react";
export default function AgentCard({ title, desc, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="text-left surface p-5 hover:bg-white/10 transition w-full"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="chip">→</span>
      </div>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </button>
  );
}
