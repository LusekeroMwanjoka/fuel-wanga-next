"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { districts } from "@/lib/data";

type Status = "Available" | "Low" | "No fuel";
type Fuel = "Petrol" | "Diesel" | "Both";
type Station = { id: string; name: string; district: string; area: string; status: Status | null; fuel: Fuel | null; queue: string | null; lastReportAt: string | null; reportCount: number; confirmations: number; conflict: boolean };
const statusLabel: Record<Status, string> = { Available: "Fuel available", Low: "Running low", "No fuel": "No fuel" };

function visitorId() {
  let id = localStorage.getItem("fuel-wanga-visitor");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("fuel-wanga-visitor", id); }
  return id;
}

function ageLabel(date: string | null) {
  if (!date) return "No recent update";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} hr ago`;
}

export default function Home() {
  const [district, setDistrict] = useState("Lilongwe");
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fuelFilter, setFuelFilter] = useState<"All" | "Petrol" | "Diesel">("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [dialog, setDialog] = useState<"add" | "edit" | "report" | null>(null);
  const [selected, setSelected] = useState<Station | null>(null);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadStations(currentDistrict = district) {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/stations?district=${encodeURIComponent(currentDistrict)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load stations.");
      const body = await response.json(); setStations(body.stations);
    } catch { setError("We could not connect to the shared station list. Check your connection and try again."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadStations(district); }, [district]);

  const filtered = useMemo(() => stations.filter(s => {
    const matchesText = `${s.name} ${s.area}`.toLowerCase().includes(search.toLowerCase());
    const matchesFuel = fuelFilter === "All" || s.fuel === "Both" || s.fuel === fuelFilter;
    return matchesText && matchesFuel && (!availableOnly || (s.status === "Available" && !s.conflict));
  }), [stations, search, fuelFilter, availableOnly]);

  function openDialog(type: "add" | "edit" | "report", station?: Station) {
    setSelected(station ?? null); setFormError(""); setDialog(type);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setFormError("");
    const form = new FormData(event.currentTarget);
    try {
      let response: Response;
      if (dialog === "add") {
        response = await fetch("/api/stations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), district, area: form.get("area") }) });
      } else if (dialog === "edit" && selected) {
        response = await fetch(`/api/stations/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name") }) });
      } else if (dialog === "report" && selected) {
        response = await fetch(`/api/stations/${selected.id}/reports`, { method: "POST", headers: { "Content-Type": "application/json", "X-Visitor-ID": visitorId() }, body: JSON.stringify({ fuel: form.get("fuel"), status: form.get("status"), queue: form.get("queue") }) });
      } else return;
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "That update could not be saved.");
      setDialog(null); setNotice(dialog === "add" ? "Station added to this district." : dialog === "edit" ? "Station name updated." : `Thank you. Your update is recorded (${body.confirmations} recent matching report${body.confirmations === 1 ? "" : "s"}).`);
      window.setTimeout(() => setNotice(""), 6000); await loadStations(district);
    } catch (e) { setFormError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }

  const regions = ["Northern", "Central", "Southern"];
  return <>
    <header className="topbar"><div className="app-shell topbar-inner"><a className="brand" href="#home"><span className="brand-icon">FW</span><span>Fuel Wanga</span></a><span className="community-tag">COMMUNITY FUEL UPDATES</span></div></header>
    <main className="app-shell">
    <section className="intro" id="home"><span className="kicker">FUEL INFORMATION FOR MALAWI</span><h1>Find fuel near you.<br/><em>Help others find it too.</em></h1><p>See what drivers have reported. Share what you see at the station.</p></section>
    <section className="finder" aria-label="Find a filling station">
      <div className="district-label"><label htmlFor="district">Choose your district</label><span>{districts.length} districts covered</span></div>
      <select id="district" className="district-select" value={district} onChange={e => setDistrict(e.target.value)}>{regions.map(region => <optgroup key={region} label={`${region} Region`}>{districts.filter(d => d.region === region).map(d => <option key={d.name}>{d.name}</option>)}</optgroup>)}</select>
      <div className="search-row"><label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search station or area" aria-label="Search station or area"/></label><button className="add-button" onClick={() => openDialog("add")}><span aria-hidden="true">＋</span> Add a station</button></div>
    </section>
    <section className="updates">
      <div className="updates-head"><div><span className="kicker">{district.toUpperCase()} DISTRICT</span><h2>Filling stations</h2></div><button className="refresh" onClick={() => void loadStations()} aria-label="Refresh station list">↻ <span>Refresh</span></button></div>
      <div className="filters"><div className="filter-tabs" aria-label="Filter by fuel type">{(["All", "Petrol", "Diesel"] as const).map(f => <button key={f} className={fuelFilter === f ? "tab active" : "tab"} onClick={() => setFuelFilter(f)}>{f === "All" ? "All fuel" : f}</button>)}</div><label className="available-filter"><input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)}/> <span>Show fuel available only</span></label></div>
      <p className="truth-note"><span>ℹ</span> A missing or old report does not mean the station is out of fuel. Call ahead if you are travelling far.</p>
      {loading ? <div className="state-card">Loading stations…</div> : error ? <div className="state-card error-state"><p>{error}</p><button className="secondary-button" onClick={() => void loadStations()}>Try again</button></div> : filtered.length ? <div className="station-list">{filtered.map(station => <article className="station-card" key={station.id}><div className="station-top"><div className="pump-icon" aria-hidden="true">⛽</div><div className="station-title"><h3>{station.name}</h3><p>{station.area} · {station.district}</p></div><span className={station.conflict ? "status status-low" : station.status ? `status status-${station.status.toLowerCase().replace(" ", "-")}` : "status status-unknown"}><i/>{station.conflict ? "Reports disagree" : station.status ? statusLabel[station.status] : "No fuel update"}</span></div>
        <div className="station-details"><span>{station.fuel || "Fuel type not confirmed"}</span><span>Queue: {station.queue || "Not reported"}</span><span className={station.lastReportAt ? "fresh-age" : "old-age"}>◷ {ageLabel(station.lastReportAt)}</span>{station.conflict ? <span className="old-age">Check before travelling</span> : station.confirmations > 0 && <span className="confirm-count">{station.confirmations} recent report{station.confirmations === 1 ? "" : "s"}</span>}</div>
        <div className="station-actions"><button onClick={() => openDialog("report", station)}>Update fuel status</button><button onClick={() => openDialog("edit", station)}>Correct station name</button></div></article>)}</div> : <div className="empty-state"><span aria-hidden="true">⌕</span><h3>{search || availableOnly ? "No matching stations" : `No stations listed in ${district} yet`}</h3><p>{search || availableOnly ? "Try changing your search or filters." : "Add a station to help drivers in this district."}</p><button className="add-button" onClick={() => openDialog("add")}>＋ Add a station</button></div>}
      <div className="count-note">{filtered.length} station{filtered.length === 1 ? "" : "s"} shown · Updates expire after 3 hours</div>
    </section>
    <section className="how"><span className="kicker">SIMPLE FOR EVERYONE</span><h2>How Fuel Wanga works</h2><div className="how-grid"><article><b>1</b><h3>Choose your district</h3><p>See stations in your area. No map or account needed.</p></article><article><b>2</b><h3>Check the update time</h3><p>Fuel reports are recent for up to 3 hours. Old reports are hidden.</p></article><article><b>3</b><h3>Share what you saw</h3><p>Report fuel and queue after visiting a station in person.</p></article></div></section>
    <footer><div className="brand"><span className="brand-icon">FW</span><span>Fuel Wanga</span></div><p>Built with drivers, for drivers in Malawi.</p><span>Station names can be corrected by the community. Fuel reports are not guarantees.</span><details><summary>Sample station information</summary><p>Some initial names are taken from the published Petroda station directory. Please check details and report corrections. No fuel status is prefilled.</p></details></footer>
    {notice && <div className="toast" role="status">✓ &nbsp;{notice}</div>}
    {dialog && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setDialog(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="close" aria-label="Close" onClick={() => setDialog(null)}>×</button>
      {dialog === "add" && <form onSubmit={submit}><span className="kicker">ADD TO {district.toUpperCase()}</span><h2 id="modal-title">Add a filling station</h2><p className="modal-help">Add a name people know and the area or trading centre where it is found.</p><label htmlFor="new-name">Station name</label><input id="new-name" name="name" maxLength={100} required placeholder="For example, Petroda Area 25"/><label htmlFor="new-area">Area or nearby place</label><input id="new-area" name="area" maxLength={100} placeholder="For example, near the market"/><button className="primary-button full" disabled={busy}>{busy ? "Saving…" : "Add station"}</button></form>}
      {dialog === "edit" && selected && <form onSubmit={submit}><span className="kicker">HELP KEEP THIS LIST RIGHT</span><h2 id="modal-title">Correct station name</h2><p className="modal-help">District: {selected.district}. Your correction will be visible to everyone.</p><label htmlFor="edit-name">Station name</label><input id="edit-name" name="name" defaultValue={selected.name} maxLength={100} required/><button className="primary-button full" disabled={busy}>{busy ? "Saving…" : "Save corrected name"}</button></form>}
      {dialog === "report" && selected && <form onSubmit={submit}><span className="kicker">COMMUNITY FUEL UPDATE</span><h2 id="modal-title">What did you see?</h2><p className="modal-help">{selected.name} · {selected.area}, {selected.district}</p><label htmlFor="report-status">Fuel situation</label><select id="report-status" name="status"><option>Available</option><option>Low</option><option>No fuel</option></select><label htmlFor="report-fuel">Fuel type</label><select id="report-fuel" name="fuel"><option>Both</option><option>Petrol</option><option>Diesel</option></select><label htmlFor="report-queue">Queue</label><select id="report-queue" name="queue"><option>No queue update</option><option>No queue</option><option>Short queue</option><option>Medium queue</option><option>Long queue</option></select><label className="honesty"><input type="checkbox" required/> I checked this station in person.</label><button className="primary-button full" disabled={busy}>{busy ? "Sharing…" : "Share update"}</button><p className="small-note">No name, phone number or account needed. One update per station every 15 minutes on this device.</p></form>}
      {formError && <p className="form-error" role="alert">{formError}</p>}
    </section></div>}
  </main>
  </>;
}
