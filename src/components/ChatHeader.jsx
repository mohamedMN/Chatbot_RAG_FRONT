import React from "react";
import { NavLink } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import Logo from "./Logo";

const MODEL_OPTIONS = ["Standard", "Concise", "Detailed"];

export default function ChatHeader({ model = "Standard", setModel }) {
  return (
    <header className="h-14 border-b border-white/10 bg-neutral-950/60 backdrop-blur flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Logo />
        <div className="font-semibold">AI Chat</div>
        <span className="ml-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/80">
          webMethods
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="model-select">
          Model
        </label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel?.(e.target.value)}
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/30 text-white"
          aria-label="Model"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <span className="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/80">
          Enjoying the experience?
        </span>

        <NavItem to="/admin" icon={MessageSquare} label="Admin" />
      </div>
    </header>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
          isActive
            ? "bg-white/10 text-white"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`
      }
      title={label}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
