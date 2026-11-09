"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t, tx } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { PumpIcon } from "@/components/PumpIcon";

type FuelStatus = "Available" | "Low" | "No fuel";
type ActiveUpdate = { id: number; fuel: string; status: FuelStatus; created_at: string };
type AdminData = {
  id: string;
  email: string;
  displayName: string;
  station: { id: string; name: string; district: string; area: string } | null;
  activeUpdates: ActiveUpdate[];
};

const FUELS = ["Petrol", "Diesel"] as const;
const STATUSES: FuelStatus[] = ["Available", "Low", "No fuel"];

function expiresAt(createdAt: string) {
  const d = new Date(new Date(createdAt).getTime() + 3 * 60 * 60 * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fuel, setFuel] = useState<"Petrol" | "Diesel">("Petrol");
  const [status, setStatus] = useState<FuelStatus>("Available");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("fw-lang") as Lang | null;
    if (stored === "ny") setLang("ny");
  }, []);

  async function loadAdmin() {
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const body = await res.json();
      if (!body.admin) { router.replace("/admin/login"); return; }
      setAdmin(body.admin);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAdmin(); }, []);

  async function signOut() {
    await fetch("/api/auth/station/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  async function postUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setFormError("");
    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fuel, status }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || t.genericError[lang]);
      setNotice(t.updateSaved[lang]);
      setTimeout(() => setNotice(""), 5000);
      await loadAdmin();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.genericError[lang]);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <div className="admin-loading">{t.loadingStations[lang]}</div>
      </div>
    );
  }

  if (!admin || !admin.station) {
    return (
      <div className="admin-shell">
        <p className="form-error">{t.genericError[lang]}</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* Header */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <PumpIcon size={28} />
            <span>Fuel Wanga</span>
          </div>
          <div className="admin-header-right">
            <button
              className="lang-toggle"
              onClick={() => {
                const next: Lang = lang === "en" ? "ny" : "en";
                setLang(next);
                localStorage.setItem("fw-lang", next);
              }}
            >
              {t.langToggle[lang]}
            </button>
            <button className="sign-out-btn" onClick={signOut}>{t.signOut[lang]}</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-station-label">
          <p className="kicker">{admin.station.district} · {admin.station.area}</p>
          <h1 className="admin-station-name">{admin.station.name}</h1>
          <p className="admin-sub">{t.adminDashSubheading[lang]}</p>
        </div>

        {/* Active updates */}
        <section className="admin-section">
          <h2 className="admin-section-title">{t.currentStatus[lang]}</h2>
          {admin.activeUpdates.length === 0 ? (
            <p className="admin-empty">{t.noActiveUpdate[lang]}</p>
          ) : (
            <div className="admin-updates-list">
              {FUELS.map((f) => {
                const update = admin.activeUpdates.find((u) => u.fuel === f);
                return (
                  <div key={f} className="admin-update-card">
                    <span className="admin-update-fuel">{f === "Petrol" ? t.petrol[lang] : t.diesel[lang]}</span>
                    {update ? (
                      <>
                        <span className={`status status-${update.status.toLowerCase().replace(" ", "-")}`}>
                          <i />
                          {update.status === "Available"
                            ? t.statusAvailable[lang]
                            : update.status === "Low"
                            ? t.statusLow[lang]
                            : t.statusNoFuel[lang]}
                        </span>
                        <span className="admin-update-expiry">
                          {tx("activeUntil", lang, expiresAt(update.created_at))}
                        </span>
                      </>
                    ) : (
                      <span className="admin-empty-fuel">{t.noActiveUpdate[lang]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="admin-note">{t.communityReportsBelow[lang]}</p>
        </section>

        {/* Post an update */}
        <section className="admin-section">
          <h2 className="admin-section-title">{t.adminUpdateHeading[lang]}</h2>
          <p className="admin-update-note">{t.adminUpdateNote[lang]}</p>
          <form onSubmit={postUpdate} className="admin-form">
            <label className="admin-label">{t.fuelType[lang]}</label>
            <div className="admin-fuel-tabs">
              {FUELS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={fuel === f ? "tab active" : "tab"}
                  onClick={() => setFuel(f)}
                >
                  {f === "Petrol" ? t.petrol[lang] : t.diesel[lang]}
                </button>
              ))}
            </div>

            <label className="admin-label">{t.fuelSituation[lang]}</label>
            <div className="admin-status-tabs">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={status === s ? "tab active" : "tab"}
                  onClick={() => setStatus(s)}
                >
                  {s === "Available"
                    ? t.statusAvailable[lang]
                    : s === "Low"
                    ? t.statusLow[lang]
                    : t.statusNoFuel[lang]}
                </button>
              ))}
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button full" disabled={busy}>
              {busy ? t.saving[lang] : t.saveUpdate[lang]}
            </button>
          </form>
        </section>
      </main>

      {notice && <div className="toast" role="status">✓ &nbsp;{notice}</div>}
    </div>
  );
}
