// src/state/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiLogin, apiLogout, apiMe, apiSignup } from "../services/api.js"; // ⬅️ add apiSignup

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  // restore session on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await apiMe();
        if (mounted) setUser(me || null);
      } catch {
        if (mounted) setUser(null);
        navigate("/");
      } finally {
        if (mounted) setBooting(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      setUser(
        res.user || { id: res.user_id, email: res.email, role: res.role }
      ); // depending on your backend shape
      return res;
    } finally {
      setLoading(false);
    }
  }

  async function signup(email, password, role = "user") {
    setLoading(true);
    try {
      const res = await apiSignup(email, password, role);
      // If your backend returns user fields inline:
      const newUser = res.user || {
        id: res.user_id,
        email: res.email,
        role: res.role,
      };
      if (newUser?.id) setUser(newUser);
      return res;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading]
  );

  if (booting) {
    return (
      <div className="min-h-dvh grid place-items-center text-white">
        <div className="opacity-70">Chargement…</div>
      </div>
    );
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
