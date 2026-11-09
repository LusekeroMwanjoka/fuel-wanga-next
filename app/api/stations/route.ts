import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { districts } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validDistrict = (name: string) =>
  districts.some((d) => d.name.toLowerCase() === name.toLowerCase());

export async function GET(request: NextRequest) {
  const district = request.nextUrl.searchParams.get("district");
  let query = supabaseAdmin
    .from("stations")
    .select("id,name,district,area,latitude,longitude,created_at")
    .order("name");
  if (district && validDistrict(district)) query = query.ilike("district", district);

  const { data: stationRows, error: stationError } = await query;
  if (stationError)
    return NextResponse.json({ error: "Could not load stations." }, { status: 503 });

  const rows = stationRows ?? [];
  if (!rows.length) return NextResponse.json({ stations: [] });

  const stationIds = rows.map((s) => s.id);
  const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  // Fetch community reports and admin updates in parallel
  const [{ data: reports, error: reportError }, { data: adminUpdates, error: adminError }] =
    await Promise.all([
      supabaseAdmin
        .from("reports")
        .select("station_id,fuel,status,queue,reporter_key,created_at")
        .in("station_id", stationIds)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(3000),
      supabaseAdmin
        .from("admin_updates")
        .select("station_id,fuel,status,created_at")
        .in("station_id", stationIds)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false }),
    ]);

  if (reportError)
    return NextResponse.json({ error: "Could not load recent reports." }, { status: 503 });
  if (adminError)
    return NextResponse.json({ error: "Could not load admin updates." }, { status: 503 });

  // Index community reports by station
  const byStation = new Map<string, NonNullable<typeof reports>>();
  for (const r of reports ?? []) {
    const list = byStation.get(r.station_id) ?? [];
    list.push(r);
    byStation.set(r.station_id, list);
  }

  // Index admin updates by station+fuel (most recent per fuel type)
  type AdminUpdate = { station_id: string; fuel: string; status: string; created_at: string };
  const adminByStationFuel = new Map<string, AdminUpdate>();
  for (const u of adminUpdates ?? []) {
    const key = `${u.station_id}:${u.fuel}`;
    if (!adminByStationFuel.has(key)) adminByStationFuel.set(key, u); // already sorted desc
  }

  const stations = rows.map((station) => {
    const recent = byStation.get(station.id) ?? [];

    // Per-fuel breakdown (Petrol + Diesel)
    const fuelReports = Object.fromEntries(
      (["Petrol", "Diesel"] as const).map((fuel) => {
        // Check for active admin update for this fuel
        const adminUpdate = adminByStationFuel.get(`${station.id}:${fuel}`);

        if (adminUpdate) {
          // Admin update takes precedence
          return [
            fuel,
            {
              status: adminUpdate.status as "Available" | "Low" | "No fuel",
              queue: null, // admins only update fuel availability, not queue
              lastReportAt: adminUpdate.created_at,
              confirmations: 0,
              conflict: false,
              source: "admin" as const,
            },
          ];
        }

        // Fall back to community reports
        const relevant = recent.filter((r) => r.fuel === fuel || r.fuel === "Both");
        const current = relevant[0];
        const sameStatus = current ? relevant.filter((r) => r.status === current.status) : [];
        return [
          fuel,
          {
            status: current?.status ?? null,
            queue: current?.queue ?? null,
            lastReportAt: current?.created_at ?? null,
            confirmations: new Set(sameStatus.map((r) => r.reporter_key)).size,
            conflict: current ? relevant.some((r) => r.status !== current.status) : false,
            source: "community" as const,
          },
        ];
      }),
    );

    // Overall (for "All fuel" filter) — prefer admin updates, else latest community report
    const adminPetrol = adminByStationFuel.get(`${station.id}:Petrol`);
    const adminDiesel = adminByStationFuel.get(`${station.id}:Diesel`);
    const latestAdmin = [adminPetrol, adminDiesel]
      .filter(Boolean)
      .sort((a, b) => new Date(b!.created_at).getTime() - new Date(a!.created_at).getTime())[0];

    const latest = recent[0];
    const matching = latest
      ? recent.filter((r) => r.fuel === latest.fuel && r.status === latest.status)
      : [];
    const confirmations = new Set(matching.map((r) => r.reporter_key)).size;
    const conflict = latest
      ? recent.some((r) => r.fuel === latest.fuel && r.status !== latest.status)
      : false;

    return {
      id: station.id,
      name: station.name,
      district: station.district,
      area: station.area,
      latitude: station.latitude,
      longitude: station.longitude,
      // Overall status — admin takes precedence
      status: (latestAdmin?.status ?? latest?.status ?? null) as
        | "Available"
        | "Low"
        | "No fuel"
        | null,
      fuel: latestAdmin?.fuel ?? latest?.fuel ?? null,
      queue: latestAdmin ? null : latest?.queue ?? null,
      lastReportAt: latestAdmin?.created_at ?? latest?.created_at ?? null,
      reportCount: recent.length,
      confirmations: latestAdmin ? 0 : confirmations,
      conflict: latestAdmin ? false : conflict,
      overallSource: latestAdmin ? ("admin" as const) : ("community" as const),
      fuelReports,
    };
  });

  return NextResponse.json({ stations });
}
