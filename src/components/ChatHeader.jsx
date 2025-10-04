import React from "react";

export default function ChatHeader({ model = "Standard", setModel }) {
  return (
    <header className="h-14 border-b border-white/10 bg-neutral-950/60 backdrop-blur flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded bg-orange-brand" />
        <div className="font-semibold">AI Chat</div>
        <span className="chip ml-2">webMethods</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={model}
          onChange={(e) => setModel?.(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-brand/30"
          aria-label="Model"
        >
          <option>Standard</option>
          <option>Concise</option>
          <option>Detailed</option>
        </select>
        <div className="chip hidden sm:inline-flex">
          Enjoying the experience?
        </div>
      </div>
    </header>
  );
}
