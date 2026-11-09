"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { PumpIcon } from "@/components/PumpIcon";

export default function SuperAdminLogin() {
  const router = useRouter();
  const [lang] = useState<Lang>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/super/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || t.genericError[lang]);
      router.replace("/super/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError[lang]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <PumpIcon size={36} />
          <span className="auth-brand-name">Fuel Wanga</span>
        </div>
        <p className="kicker" style={{ textAlign: "center", marginBottom: 4 }}>SUPER ADMIN</p>
        <h1 className="auth-heading">{t.superAdminSignIn[lang]}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email" className="auth-label">{t.emailLabel[lang]}</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <label htmlFor="password" className="auth-label">{t.passwordLabel[lang]}</label>
          <input
            id="password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit primary-button full" disabled={busy}>
            {busy ? t.signingIn[lang] : t.signIn[lang]}
          </button>
        </form>
        <p className="auth-back"><a href="/">← Back to station finder</a></p>
      </div>
    </div>
  );
}
