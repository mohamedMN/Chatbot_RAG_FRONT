import React from "react";
import { NavLink, Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { Button } from "@/components/ui/button";
import { BarChart3, History, MessageSquare, LogOut } from "lucide-react";

/**
 * Left navigation for Admin pages.
 * Props:
 *   onLogout?: () => void
 */
export default function AdminSidebar({ onLogout }) {
  return (
    <aside className="border-r border-white/10 bg-white/5 backdrop-blur sticky top-0 h-dvh w-[260px] p-4 flex flex-col text-white">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 mb-4">
        <Logo />
        <div className="font-semibold truncate">Admin</div>
      </Link>

      {/* Nav */}
      <nav className="grid gap-1">
        <NavItem to="/admin" icon={BarChart3} label="Stats API" />
        <NavItem
          to="/history"
          icon={History}
          label="Historique des conversations"
        />
        <NavItem to="/chat" icon={MessageSquare} label="Chat" />
      </nav>

      {/* Footer / logout */}
      <div className="mt-auto">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>
        <div className="mt-3 text-[11px] text-white/50">
          Orange · webMethods
        </div>
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
        ${
          isActive
            ? "bg-white/10 text-white"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
