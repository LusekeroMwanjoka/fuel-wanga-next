"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { PumpIcon } from "@/components/PumpIcon";

type StationAdmin = {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  station_id: string;
  created_at: string;
  stations: { id: string; name: string; district: string } | null;
};
type Station = { id: string; name: string; district: string; area: string };

type ModalState =
  | { type: "create" }
  | { type: "edit"; admin: StationAdmin }
  | { type: "reset"; admin: StationAdmin }
  | null;

export default function SuperDashboard() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [admins, setAdmins] = useState<StationAdmin[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"admins" | "stations">("admins");

  // Form state for create/edit
  const [formEmail, setFormEmail] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formStationId, setFormStationId] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fw-lang") as Lang | null;
    if (stored === "ny") setLang("ny");
  }, []);

  async function load() {
    const [ar, sr] = await Promise.all([
      fetch("/api/super/admins", { cache: "no-store" }),
      fetch("/api/super/stations", { cache: "no-store" }),
    ]);
    if (ar.status === 401 || sr.status === 401) {
      router.replace("/super/login");
      return;
    }
    const [ab, sb] = await Promise.all([ar.json(), sr.json()]);
    setAdmins(ab.admins ?? []);
    setStations(sb.stations ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function signOut() {
    await fetch("/api/auth/super/logout", { method: "POST" });
    router.replace("/super/login");
  }

  function openCreate() {
    setFormEmail(""); setFormDisplayName(""); setFormStationId(""); setFormError("");
    setModal({ type: "create" });
  }

  function openEdit(admin: StationAdmin) {
    setFormDisplayName(admin.display_name); setFormStationId(admin.station_id); setFormError("");
    setModal({ type: "edit", admin });
  }

  function openReset(admin: StationAdmin) {
    setFormPassword(""); setFormError("");
    setModal({ type: "reset", admin });
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setFormError("");
    try {
      const res = await fetch("/api/super/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail, displayName: formDisplayName, stationId: formStationId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setModal(null);
      setNotice(t.adminCreated[lang]);
      setTimeout(() => setNotice(""), 4000);
      await load();
    } catch (err) { setFormError(err instanceof Error ? err.message : t.genericError[lang]); }
    finally { setBusy(false); }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || modal?.type !== "edit") return;
    setBusy(true); setFormError("");
    try {
      const res = await fetch(`/api/super/admins/${modal.admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: formDisplayName, stationId: formStationId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setModal(null);
      setNotice(t.adminUpdated[lang]);
      setTimeout(() => setNotice(""), 4000);
      await load();
    } catch (err) { setFormError(err instanceof Error ? err.message : t.genericError[lang]); }
    finally { setBusy(false); }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (busy || modal?.type !== "reset") return;
    setBusy(true); setFormError("");
    try {
      const res = await fetch(`/api/super/admins/${modal.admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setModal(null);
      setNotice(t.adminUpdated[lang]);
      setTimeout(() => setNotice(""), 4000);
      await load();
    } catch (err) { setFormError(err instanceof Error ? err.message : t.genericError[lang]); }
    finally { setBusy(false); }
  }

  async function toggleActive(admin: StationAdmin) {
    try {
      await fetch(`/api/super/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.is_active }),
      });
      await load();
    } catch { /* silent */ }
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand"><PumpIcon size={28} /><span>Fuel Wanga</span></div>
          <div className="admin-header-right">
            <button className="lang-toggle" onClick={() => {
              const next: Lang = lang === "en" ? "ny" : "en";
              setLang(next); localStorage.setItem("fw-lang", next);
            }}>{t.langToggle[lang]}</button>
            <button className="sign-out-btn" onClick={signOut}>{t.signOut[lang]}</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-station-label">
          <p className="kicker">SUPER ADMIN</p>
          <h1 className="admin-station-name">{t.superAdminDashHeading[lang]}</h1>
        </div>

        <div className="admin-tabs">
          <button className={tab === "admins" ? "tab active" : "tab"} onClick={() => setTab("admins")}>
            {t.stationAdmins[lang]} ({admins.length})
          </button>
          <button className={tab === "stations" ? "tab active" : "tab"} onClick={() => setTab("stations")}>
            {t.stations[lang]} ({stations.length})
          </button>
        </div>

        {loading ? (
          <div className="state-card">{t.loadingStations[lang]}</div>
        ) : tab === "admins" ? (
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">{t.stationAdmins[lang]}</h2>
              <button className="primary-button" onClick={openCreate}>{t.createAdmin[lang]}</button>
            </div>
            {admins.length === 0 ? (
              <p className="admin-empty">No admin accounts yet.</p>
            ) : (
              <div className="super-admin-list">
                {admins.map((admin) => (
                  <div key={admin.id} className={`super-admin-row ${admin.is_active ? "" : "disabled"}`}>
                    <div className="super-admin-info">
                      <p className="super-admin-name">{admin.display_name}</p>
                      <p className="super-admin-email">{admin.email}</p>
                      <p className="super-admin-station">
                        {admin.stations ? `${admin.stations.name} · ${admin.stations.district}` : "No station"}
                      </p>
                      {!admin.is_active && <span className="disabled-badge">Disabled</span>}
                    </div>
                    <div className="super-admin-actions">
                      <button className="secondary-button" onClick={() => openEdit(admin)}>{t.editAdmin[lang]}</button>
                      <button className="secondary-button" onClick={() => openReset(admin)}>{t.resetPassword[lang]}</button>
                      <button className="secondary-button" onClick={() => toggleActive(admin)}>
                        {admin.is_active ? t.disableAdmin[lang] : t.enableAdmin[lang]}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="admin-section">
            <h2 className="admin-section-title">{t.stations[lang]}</h2>
            <div className="super-stations-list">
              {stations.map((s) => (
                <div key={s.id} className="super-station-row">
                  <div>
                    <p className="super-admin-name">{s.name}</p>
                    <p className="super-admin-email">{s.district} · {s.area}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="close" aria-label="Close" onClick={() => setModal(null)}>×</button>

            {modal.type === "create" && (
              <form onSubmit={submitCreate}>
                <span className="kicker">NEW ACCOUNT</span>
                <h2 id="modal-title" className="modal-h2">{t.createAdmin[lang]}</h2>
                <label className="modal-label" htmlFor="c-email">{t.emailLabel[lang]}</label>
                <input id="c-email" className="modal-input" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required />
                <label className="modal-label" htmlFor="c-name">Display name</label>
                <input id="c-name" className="modal-input" value={formDisplayName} onChange={e => setFormDisplayName(e.target.value)} />
                <label className="modal-label" htmlFor="c-station">Station</label>
                <select id="c-station" className="modal-input" value={formStationId} onChange={e => setFormStationId(e.target.value)} required>
                  <option value="">Select a station…</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.district})</option>)}
                </select>
                <p className="admin-empty">Supabase Auth will send an account invitation to this email. The user sets their own password.</p>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <button className="primary-button full" disabled={busy}>{busy ? t.saving[lang] : t.createAdmin[lang]}</button>
              </form>
            )}

            {modal.type === "edit" && (
              <form onSubmit={submitEdit}>
                <span className="kicker">EDIT ACCOUNT</span>
                <h2 id="modal-title" className="modal-h2">{t.editAdmin[lang]}: {modal.admin.email}</h2>
                <label className="modal-label" htmlFor="e-name">Display name</label>
                <input id="e-name" className="modal-input" value={formDisplayName} onChange={e => setFormDisplayName(e.target.value)} />
                <label className="modal-label" htmlFor="e-station">Station</label>
                <select id="e-station" className="modal-input" value={formStationId} onChange={e => setFormStationId(e.target.value)} required>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.district})</option>)}
                </select>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <button className="primary-button full" disabled={busy}>{busy ? t.saving[lang] : t.saveUpdate[lang]}</button>
              </form>
            )}

            {modal.type === "reset" && (
              <form onSubmit={submitReset}>
                <span className="kicker">RESET PASSWORD</span>
                <h2 id="modal-title" className="modal-h2">{t.resetPassword[lang]}: {modal.admin.email}</h2>
                <label className="modal-label" htmlFor="r-pass">New {t.passwordLabel[lang]}</label>
                <input id="r-pass" className="modal-input" type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} required minLength={10} />
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <button className="primary-button full" disabled={busy}>{busy ? t.saving[lang] : t.resetPassword[lang]}</button>
              </form>
            )}
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status">✓ &nbsp;{notice}</div>}
    </div>
  );
}
