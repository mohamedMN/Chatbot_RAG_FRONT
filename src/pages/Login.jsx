import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const nav = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const emailRef = useRef(null);
  const pwdRef = useRef(null);

  // On mount: preload remembered email (frontend only)
  useEffect(() => {
    const remembered = localStorage.getItem("remember_me") === "true";
    const rememberedEmail = localStorage.getItem("remember_email") || "";
    if (remembered && rememberedEmail) {
      setRemember(true);
      setEmail(rememberedEmail);
      // focus password if email already filled
      setTimeout(() => pwdRef.current?.focus(), 0);
    } else {
      emailRef.current?.focus();
    }
  }, []);

  const isDisabled = useMemo(
    () => loading || email.trim() === "" || password.trim() === "",
    [loading, email, password]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // Persist or clear local email based on checkbox
    if (remember) {
      localStorage.setItem("remember_me", "true");
      localStorage.setItem("remember_email", email.trim());
    } else {
      localStorage.removeItem("remember_me");
      localStorage.removeItem("remember_email");
    }

    try {
      await login(email, password); // no API change needed
      nav("/admin", { replace: true });
    } catch (e) {
      setErr(e?.message || "Erreur d’authentification");
      pwdRef.current?.focus();
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-b from-[#0b0f14] via-[#0b0f14] to-[#0e1218] text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Logo />
          <div className="font-semibold">Orange Business · webMethods</div>
        </div>

        {/* Titre + sous-titre */}
        <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
        <p className="text-sm text-white/70 mt-1">
          Accédez au tableau de bord administrateur.
        </p>

        {/* Alerte d’erreur */}
        {err && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          {/* Email */}
          <label className="grid gap-1">
            <span className="text-sm">Email</span>
            <div className="relative">
              <input
                ref={emailRef}
                className="peer w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pl-10 outline-none focus:ring-2 focus:ring-orange-brand/40"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="prenom.nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={!!err}
              />
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 peer-focus:text-white/70" />
            </div>
          </label>

          {/* Password */}
          <label className="grid gap-1">
            <span className="text-sm">Mot de passe</span>
            <div className="relative">
              <input
                ref={pwdRef}
                className="peer w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pl-10 pr-10 outline-none focus:ring-2 focus:ring-orange-brand/40"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) =>
                  setCapsOn(
                    e.getModifierState && e.getModifierState("CapsLock")
                  )
                }
                required
                aria-invalid={!!err}
              />
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 peer-focus:text-white/70" />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={
                  showPwd
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-brand/40"
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {capsOn && (
              <div className="text-xs text-amber-300/90">Verr. Maj activée</div>
            )}
          </label>

          {/* Remember me (frontend only) */}
          <label className="inline-flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-white/10"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Se souvenir de moi sur cet appareil</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-black shadow-[0_8px_20px_-8px_rgba(255,140,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              isDisabled
                ? "bg-orange-400/50 cursor-not-allowed"
                : "bg-orange-brand hover:brightness-110"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-white/60">
          <Link to="/" className="hover:underline">
            ← Retour
          </Link>
          <span>
            Besoin d’un compte ?{" "}
            <Link to="/signup" className="text-white/80 hover:underline">
              Créer un compte
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
