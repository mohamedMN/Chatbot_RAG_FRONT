import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function Sidebar({ categories = [], recents = [] }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex w-[280px] flex-col gap-4 p-4 bg-black/40 border-r border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-[#ff7900]" />
          <div className="font-semibold">Orange Business</div>
        </div>
        <Link to="/chat" className="btn-primary">
          + New
        </Link>
      </div>

      <div className="surface p-2">
        <input
          className="w-full bg-transparent px-3 py-2 text-sm outline-none"
          placeholder="Search"
        />
      </div>

      <div className="surface p-3">
        <div className="text-xs uppercase tracking-widest text-white/60 mb-2">
          Category
        </div>
        <div className="space-y-1">
          {categories.map((c) => (
            <button
              key={c.id}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded bg-white/40" />
                {c.label}
              </span>
              <span className="text-white/50 text-xs">…</span>
            </button>
          ))}
        </div>
      </div>

      <div className="surface p-3">
        <div className="text-xs uppercase tracking-widest text-white/60 mb-2">
          Recent Chats
        </div>
        <div className="space-y-1">
          {recents.map((r) => (
            <Link
              key={r.id}
              to="/chat"
              className="block rounded-lg px-3 py-2 hover:bg-white/5 truncate text-sm text-white/90"
            >
              {r.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto surface p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">User Profile</div>
          {user ? (
            <button className="btn-outline" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link className="btn-outline" to="/login">
              Login
            </Link>
          )}
        </div>
        <div className="text-xs text-white/60 mt-2">{pathname}</div>
      </div>
    </aside>
  );
}
