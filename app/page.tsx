"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { districts } from "@/lib/data";
import { t, tx } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { BrandIcon, PumpIcon } from "@/components/PumpIcon";

type Status = "Available" | "Low" | "No fuel";
type FuelReport = {
  status: Status | null;
  queue: string | null;
  lastReportAt: string | null;
  confirmations: number;
  conflict: boolean;
  source: "admin" | "community";
};
type Station = {
  id: string;
  name: string;
  district: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  status: Status | null;
  fuel: string | null;
  queue: string | null;
  lastReportAt: string | null;
  reportCount: number;
  confirmations: number;
  conflict: boolean;
  overallSource: "admin" | "community";
  fuelReports: Record<"Petrol" | "Diesel", FuelReport>;
};

const STATION_PAGE_SIZE = 6;

function visitorId() {
  let id = localStorage.getItem("fuel-wanga-visitor");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("fuel-wanga-visitor", id); }
  return id;
}

function ageLabel(date: string | null, lang: Lang): string {
  if (!date) return t.noRecentUpdate[lang];
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return t.justNow[lang];
  if (minutes < 60) return tx("minsAgo", lang, minutes);
  return tx("hoursAgo", lang, Math.floor(minutes / 60));
}

function adminTimeLabel(date: string, lang: Lang): string {
  const time = new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return tx("stationUpdated", lang, time);
}

function directionsUrl(station: Station) {
  if (station.latitude !== null && station.longitude !== null) {
    return `https://maps.google.com/?daddr=${station.latitude},${station.longitude}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(`${station.name}, ${station.area}, ${station.district}, Malawi`)}`;
}

function statusClass(status: Status | null, conflict: boolean) {
  if (conflict) return "status status-low";
  if (!status) return "status status-unknown";
  return `status status-${status.toLowerCase().replace(" ", "-")}`;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [district, setDistrict] = useState("Lilongwe");
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fuelFilter, setFuelFilter] = useState<"All" | "Petrol" | "Diesel">("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(STATION_PAGE_SIZE);
  const [dialog, setDialog] = useState<"report" | null>(null);
  const [selected, setSelected] = useState<Station | null>(null);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // Persist language choice
  useEffect(() => {
    const stored = localStorage.getItem("fw-lang") as Lang | null;
    if (stored === "ny") setLang("ny");
  }, []);

  function toggleLang() {
    const next: Lang = lang === "en" ? "ny" : "en";
    setLang(next);
    localStorage.setItem("fw-lang", next);
  }

  async function loadStations(d = district) {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/stations?district=${encodeURIComponent(d)}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const body = await res.json();
      setStations(body.stations);
    } catch {
      setError(t.connectionError[lang]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadStations(district); }, [district]);
  useEffect(() => { setVisibleCount(STATION_PAGE_SIZE); }, [district, search, fuelFilter, availableOnly]);

  const filtered = useMemo(
    () => stations.filter((s) =>
      `${s.name} ${s.area}`.toLowerCase().includes(search.toLowerCase()),
    ),
    [stations, search],
  );

  function getReport(station: Station): FuelReport {
    if (fuelFilter === "All") {
      return {
        status: station.status,
        queue: station.queue,
        lastReportAt: station.lastReportAt,
        confirmations: station.confirmations,
        conflict: station.conflict,
        source: station.overallSource,
      };
    }
    return (
      station.fuelReports?.[fuelFilter] ?? {
        status: null, queue: null, lastReportAt: null, confirmations: 0, conflict: false, source: "community",
      }
    );
  }

  const visible = filtered.filter((s) => {
    const r = getReport(s);
    return !availableOnly || (r.status === "Available" && !r.conflict);
  });
  const displayed = visible.slice(0, visibleCount);

  function openReport(station: Station) {
    setSelected(station); setFormError(""); setDialog("report");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setFormError("");
    const form = new FormData(e.currentTarget);
    try {
      if (!selected) return;
      const res = await fetch(`/api/stations/${selected.id}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Visitor-ID": visitorId() },
        body: JSON.stringify({ fuel: form.get("fuel"), status: form.get("status"), queue: form.get("queue") }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || t.genericError[lang]);
      setDialog(null);
      setNotice(tx("thankYouReport", lang, body.confirmations ?? 0));
      setTimeout(() => setNotice(""), 6000);
      await loadStations(district);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.genericError[lang]);
    } finally {
      setBusy(false);
    }
  }

  const regions = ["Northern", "Central", "Southern"];

  return (
    <>
      {/* ── Header ─────────────────────────────────────── */}
      <header className="topbar">
        <div className="app-shell topbar-inner">
          <a className="brand" href="#home">
            <BrandIcon size={37} />
            <span>Fuel Wanga</span>
          </a>
          <div className="topbar-right">
            <button className="lang-toggle" onClick={toggleLang} aria-label="Switch language">
              {t.langToggle[lang]}
            </button>
            <span className="community-tag">{t.tagline[lang].toUpperCase()}</span>
          </div>
        </div>
      </header>

      <main className="app-shell">
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="intro" id="home">
          <span className="kicker">{t.heroEyebrow[lang].toUpperCase()}</span>
          <h1>
            {t.heroHeading[lang]}<br />
            <em>{t.heroHeadingSub[lang]}</em>
          </h1>
          <p>{t.heroBody[lang]}</p>
        </section>

        {/* ── Finder ─────────────────────────────────────── */}
        <section className="finder" aria-label={t.chooseDistrict[lang]}>
          <div className="district-label">
            <label htmlFor="district">{t.chooseDistrict[lang]}</label>
            <span>{tx("districtsCount", lang, districts.length)}</span>
          </div>
          <select
            id="district"
            className="district-select"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {regions.map((region) => (
              <optgroup key={region} label={`${region} Region`}>
                {districts.filter((d) => d.region === region).map((d) => (
                  <option key={d.name}>{d.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="search-row">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder[lang]}
                aria-label={t.searchPlaceholder[lang]}
              />
            </label>
          </div>
        </section>

        {/* ── Station list ───────────────────────────────── */}
        <section className="updates">
          <div className="updates-head">
            <div>
              <span className="kicker">{district.toUpperCase()} DISTRICT</span>
              <h2>{t.fillingStations[lang]}</h2>
            </div>
            <button className="refresh" onClick={() => void loadStations()} aria-label={t.refresh[lang]}>
              ↻ <span>{t.refresh[lang]}</span>
            </button>
          </div>

          <div className="filters">
            <div className="filter-tabs" aria-label="Filter by fuel type">
              {(["All", "Petrol", "Diesel"] as const).map((f) => (
                <button
                  key={f}
                  className={fuelFilter === f ? "tab active" : "tab"}
                  onClick={() => setFuelFilter(f)}
                >
                  {f === "All" ? t.allFuel[lang] : f === "Petrol" ? t.petrol[lang] : t.diesel[lang]}
                </button>
              ))}
            </div>
            <label className="available-filter">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
              />
              <span>{t.showAvailableOnly[lang]}</span>
            </label>
          </div>

          <p className="truth-note">
            <span aria-hidden="true">ℹ</span> {t.truthNote[lang]}
          </p>

          {loading ? (
            <div className="state-card">{t.loadingStations[lang]}</div>
          ) : error ? (
            <div className="state-card error-state">
              <p>{error}</p>
              <button className="secondary-button" onClick={() => void loadStations()}>
                {t.tryAgain[lang]}
              </button>
            </div>
          ) : visible.length ? (
            <>
              <div className="station-list">
                {displayed.map((station) => {
                  const report = getReport(station);
                  return (
                    <article className="station-card" key={station.id}>
                      <div className="station-top">
                        <div className="pump-icon" aria-hidden="true">
                          <PumpIcon size={22} />
                        </div>
                        <div className="station-title">
                          <h3>{station.name}</h3>
                          <p>{station.area} · {station.district}</p>
                        </div>
                        <span className={statusClass(report.status, report.conflict)}>
                          <i />
                          {report.conflict
                            ? t.reportsDisagree[lang]
                            : report.status === "Available"
                            ? t.statusAvailable[lang]
                            : report.status === "Low"
                            ? t.statusLow[lang]
                            : report.status === "No fuel"
                            ? t.statusNoFuel[lang]
                            : t.statusUnknown[lang]}
                        </span>
                      </div>
                      <div className="station-details">
                        {report.queue && report.queue !== "No queue update" && (
                          <span>{tx("queueLabel", lang, t.queueValues[lang][report.queue as keyof typeof t.queueValues.en] ?? report.queue)}</span>
                        )}
                        <span className={report.lastReportAt ? "fresh-age" : "old-age"}>
                          ◷ {report.source === "admin" && report.lastReportAt
                            ? adminTimeLabel(report.lastReportAt, lang)
                            : ageLabel(report.lastReportAt, lang)}
                        </span>
                        {report.conflict ? (
                          <span className="old-age">{t.checkBeforeTravelling[lang]}</span>
                        ) : report.source === "community" && report.confirmations > 0 ? (
                          <span className="confirm-count">{tx("confirmations", lang, report.confirmations)}</span>
                        ) : null}
                      </div>
                      <div className="station-actions">
                        <button onClick={() => openReport(station)}>{t.updateFuelStatus[lang]}</button>
                        <a className="map-link" href={directionsUrl(station)} target="_blank" rel="noopener noreferrer">
                          {t.openDirections[lang]}
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
              {visibleCount < visible.length && (
                <button
                  className="view-more"
                  onClick={() => setVisibleCount((c) => c + STATION_PAGE_SIZE)}
                >
                  {t.viewMore[lang]}
                </button>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">⌕</span>
              <h3>
                {search || availableOnly
                  ? t.noMatchingStations[lang]
                  : tx("noStationsDistrict", lang, district)}
              </h3>
              <p>
                {search || availableOnly
                  ? t.tryChangingFilters[lang]
                  : t.buildingList[lang]}
              </p>
            </div>
          )}

          <div className="count-note">
            {tx("showingCount", lang, displayed.length, visible.length, t.station[lang])}
          </div>
        </section>

        {/* ── How it works ───────────────────────────────── */}
        <section className="how">
          <span className="kicker">{t.howEyebrow[lang].toUpperCase()}</span>
          <h2>{t.howHeading[lang]}</h2>
          <div className="how-grid">
            <article><b>1</b><h3>{t.howStep1Title[lang]}</h3><p>{t.howStep1Body[lang]}</p></article>
            <article><b>2</b><h3>{t.howStep2Title[lang]}</h3><p>{t.howStep2Body[lang]}</p></article>
            <article><b>3</b><h3>{t.howStep3Title[lang]}</h3><p>{t.howStep3Body[lang]}</p></article>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="site-footer">
          <div className="site-footer-inner">

            {/* Col 1 — Fuel Wanga brand */}
            <div className="footer-col footer-col-brand">
              <div className="brand footer-brand">
                <BrandIcon size={32} />
                <span>Fuel Wanga</span>
              </div>
              <p className="footer-body">Built for Malawian drivers.</p>
              <p className="footer-body">{t.footerDisclaimer[lang]}</p>
              <p className="footer-copy padding-top 5">© {new Date().getFullYear()} Fuel Wanga</p>
            </div>

            {/* Col 2 — Site links */}
            <div className="footer-col">
              <p className="footer-col-heading">Explore</p>
              <nav className="footer-nav">
                <a href="/#home">Home</a>
                <a href="/about">About</a>
                <a href="/how-it-works">How it works</a>
                <a href="/privacy">Privacy Policy</a>
              </nav>
            </div>

            {/* Col 3 — HiSoft developer credit */}
            <div className="footer-col footer-col-dev">
              <p className="footer-col-heading">Developed by</p>
              <a
                href="https://hisofttechnologies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hisoft-brand"
                aria-label="HiSoft Technologies"
              >
                <span className="hisoft-mark" aria-hidden="true">
                  <svg viewBox="0 0 48 48" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="8" width="9" height="32" rx="4.5" fill="white"/>
                    <path d="M15 24 Q15 20 19 20 H30 Q39 20 39 28 V40 Q39 44 34.5 44 Q30 44 30 40 V28 H15" fill="white"/>
                    <circle cx="33" cy="11" r="6" fill="#0d9f6e"/>
                  </svg>
                </span>
                <span className="hisoft-wordmark">
                  <span className="hisoft-name">HiSoft</span>
                  <span className="hisoft-sub">TECHNOLOGIES</span>
                </span>
              </a>
              <div className="footer-contacts">
                <a href="https://hisofttechnologies.com" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  hisofttechnologies.com
                </a>
                <a href="tel:+265882861462" className="footer-contact-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.53 6.53l.97-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Contact (+265)
                </a>
                <a href="mailto:hisofttechnologies@gmail.com" className="footer-contact-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  hisofttechnologies@gmail.com
                </a>
              </div>
            </div>

          </div>
        </footer>
      </main>

      {/* ── Report modal ───────────────────────────────── */}
      {notice && <div className="toast" role="status">✓ &nbsp;{notice}</div>}
      {dialog && selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setDialog(null); }}
        >
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="close" aria-label="Close" onClick={() => setDialog(null)}>×</button>
            <form onSubmit={submit}>
              <span className="kicker">{t.reportModalEyebrow[lang].toUpperCase()}</span>
              <h2 id="modal-title">{t.reportModalHeading[lang]}</h2>
              <p className="modal-help">{selected.name} · {selected.area}, {selected.district}</p>
              <label htmlFor="report-status">{t.fuelSituation[lang]}</label>
              <select id="report-status" name="status">
                <option>Available</option>
                <option>Low</option>
                <option>No fuel</option>
              </select>
              <label htmlFor="report-fuel">{t.fuelType[lang]}</label>
              <select id="report-fuel" name="fuel">
                <option>Both</option>
                <option>Petrol</option>
                <option>Diesel</option>
              </select>
              <label htmlFor="report-queue">{t.queue[lang]}</label>
              <select id="report-queue" name="queue">
                <option>No queue update</option>
                <option>No queue</option>
                <option>Short queue</option>
                <option>Medium queue</option>
                <option>Long queue</option>
              </select>
              <label className="honesty">
                <input type="checkbox" required />
                {t.honestyCheck[lang]}
              </label>
              <button className="primary-button full" disabled={busy}>
                {busy ? t.sharing[lang] : t.shareUpdate[lang]}
              </button>
              <p className="small-note">{t.reportSmallNote[lang]}</p>
            </form>
            {formError && <p className="form-error" role="alert">{formError}</p>}
          </section>
        </div>
      )}
    </>
  );
}
