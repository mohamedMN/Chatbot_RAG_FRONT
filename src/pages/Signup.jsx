import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function Signup() {
  const nav = useNavigate();
  const { signup, loading } = useAuth?.() || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsOnPwd, setCapsOnPwd] = useState(false);
  const [capsOnConfirm, setCapsOnConfirm] = useState(false);
  const [accept, setAccept] = useState(true); // set false if you want checkbox mandatory
  const [role, setRole] = useState("user");

  const emailRef = useRef(null);
  const pwdRef = useRef(null);

// in onSubmit:
    
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  function validatePassword(pwd) {
    const rules = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    const ok = Object.values(rules).every(Boolean);
    return { ok, rules };
  }

  const { ok: pwdOK, rules } = useMemo(
    () => validatePassword(password),
    [password]
  );

  const passwordsMatch = useMemo(
    () => password === confirm && confirm.length > 0,
    [password, confirm]
  );

  const isDisabled = useMemo(
    () =>
      loading ||
      email.trim() === "" ||
      password.trim() === "" ||
      confirm.trim() === "" ||
      !pwdOK ||
      !passwordsMatch ||
      !accept,
    [loading, email, password, confirm, pwdOK, passwordsMatch, accept]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!pwdOK) {
      setErr("Le mot de passe ne respecte pas les critères.");
      return;
      }
    

    if (!passwordsMatch) {
      setErr("Les mots de passe ne correspondent pas.");
      pwdRef.current?.focus();
      return;
    }
    try {
      if (!signup)
        throw new Error(
          "La méthode signup() n’est pas disponible dans useAuth."
        );
        console.log("mail, password, role : " + email, password, role);
      await signup(email, password, role);
      nav("/admin", { replace: true });
    } catch (e) {
      setErr(e?.message || "Erreur lors de la création du compte");
      pwdRef.current?.focus();
    }
  }

  // simple strength score (0-5)
  const strength = useMemo(() => {
    let s = 0;
    if (rules.length) s++;
    if (rules.lower) s++;
    if (rules.upper) s++;
    if (rules.number) s++;
    if (rules.special) s++;
    return s;
  }, [rules]);

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-b from-[#0b0f14] via-[#0b0f14] to-[#0e1218] text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-orange-brand" />
          <div className="font-semibold">Orange Business · webMethods</div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
        <p className="text-sm text-white/70 mt-1">
          Accédez au tableau de bord administrateur.
        </p>

        {/* Error alert */}
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
          <select
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-brand/40 text-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option
              value="user"
              style={{ backgroundColor: "#0b0f14", color: "white" }}
            >
              Utilisateur
            </option>
            <option
              value="admin"
              style={{ backgroundColor: "#0b0f14", color: "white" }}
            >
              Administrateur
            </option>
          </select>
          {/* Password */}
          <label className="grid gap-1">
            <span className="text-sm">Mot de passe</span>
            <div className="relative">
              <input
                ref={pwdRef}
                className="peer w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pl-10 pr-10 outline-none focus:ring-2 focus:ring-orange-brand/40"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) =>
                  setCapsOnPwd(
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

            {/* Strength bar */}
            <div className="mt-2">
              <div className="h-1 w-full rounded bg-white/10 overflow-hidden">
                <div
                  className={`h-1 transition-all`}
                  style={{
                    width: `${(strength / 5) * 100}%`,
                    background:
                      strength <= 2
                        ? "#ef4444"
                        : strength === 3
                        ? "#f59e0b"
                        : "#22c55e",
                  }}
                />
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2 text-[11px] text-white/70">
                <span className={rules.length ? "text-white" : ""}>≥8</span>
                <span className={rules.lower ? "text-white" : ""}>a-z</span>
                <span className={rules.upper ? "text-white" : ""}>A-Z</span>
                <span className={rules.number ? "text-white" : ""}>0-9</span>
                <span className={rules.special ? "text-white" : ""}>symb.</span>
              </div>
            </div>

            {capsOnPwd && (
              <div className="text-xs text-amber-300/90">Verr. Maj activée</div>
            )}
          </label>

          {/* Confirm password */}
          <label className="grid gap-1">
            <span className="text-sm">Confirmer le mot de passe</span>
            <div className="relative">
              <input
                className="peer w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pl-10 pr-10 outline-none focus:ring-2 focus:ring-orange-brand/40"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyUp={(e) =>
                  setCapsOnConfirm(
                    e.getModifierState && e.getModifierState("CapsLock")
                  )
                }
                required
                aria-invalid={!!err || (!passwordsMatch && confirm.length > 0)}
              />
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 peer-focus:text-white/70" />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={
                  showConfirm
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-brand/40"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {!passwordsMatch && confirm.length > 0 && (
              <div className="text-xs text-red-300">
                Les mots de passe ne correspondent pas
              </div>
            )}
            {capsOnConfirm && (
              <div className="text-xs text-amber-300/90">Verr. Maj activée</div>
            )}
          </label>

          {/* Terms / policy (optional) */}
          <label className="mt-1 inline-flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-white/10"
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              J’accepte la politique de sécurité et de confidentialité.
            </span>
          </label>

          {/* Actions */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`mt-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-black shadow-[0_8px_20px_-8px_rgba(255,140,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              isDisabled
                ? "bg-orange-400/50 cursor-not-allowed"
                : "bg-orange-brand hover:brightness-110"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-white/60">
          <Link to="/" className="hover:underline">
            ← Retour
          </Link>
          <span>
            Déjà un compte ?{" "}
            <Link to="/login" className="text-white/80 hover:underline">
              Se connecter
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
