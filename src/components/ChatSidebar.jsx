import React from "react";
import Logo from "./Logo";

export default function ChatSidebar({
  history = [],
  onSelect,
  onNew,
  onDeleteAll,
}) {
  return (
    <aside className="w-72 bg-neutral-950/60 border-r border-white/10 hidden md:flex md:flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <Logo/>
        <div className="font-semibold">Chat History</div>
      </div>

      <div className="p-3 space-y-3">
        <button onClick={onNew} className="w-full btn-ghost justify-start">
          New Chat
        </button>

        <div className="text-xs uppercase tracking-wide text-white/50 px-1">
          Chats
        </div>
        <div className="space-y-1">
          {history.length === 0 && (
            <div className="text-white/50 text-sm px-2 py-1">No chats yet</div>
          )}
          {history.map((h, i) => (
            <button
              key={h.id ?? i}
              onClick={() => onSelect(h)}
              className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10"
              title={h.title}
            >
              <div className="truncate">{h.title}</div>
              <div className="text-xs text-white/50 truncate">{h.subtitle}</div>
            </button>
          ))}
        </div>

        <button
          onClick={onDeleteAll}
          className="w-full btn-outline justify-start mt-4"
        >
          Delete Chat History
        </button>
      </div>
    </aside>
  );
}
