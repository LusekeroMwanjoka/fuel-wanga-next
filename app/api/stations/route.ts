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

  const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const { data: reports, error: reportError } = await supabaseAdmin
    .from("reports")
    .select("station_id,fuel,status,queue,reporter_key,created_at")
    .in("station_id", rows.map((station) => station.id))
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(3000);

  if (reportError)
    return NextResponse.json({ error: "Could not load recent reports." }, { status: 503 });

  const byStation = new Map<string, NonNullable<typeof reports>>();
  for (const report of reports ?? []) {
    const list = byStation.get(report.station_id) ?? [];
    list.push(report);
    byStation.set(report.station_id, list);
  }

  const stations = rows.map((station) => {
    const recent = byStation.get(station.id) ?? [];
    const latest = recent[0];
    const matching = latest
      ? recent.filter((r) => r.fuel === latest.fuel && r.status === latest.status)
      : [];
    const confirmations = new Set(matching.map((r) => r.reporter_key)).size;
    const conflict = latest
      ? recent.some((r) => r.fuel === latest.fuel && r.status !== latest.status)
      : false;
    const fuelReports = Object.fromEntries((['Petrol', 'Diesel'] as const).map((fuel) => {
      const relevant = recent.filter((r) => r.fuel === fuel || r.fuel === 'Both');
      const current = relevant[0];
      const sameStatus = current ? relevant.filter((r) => r.status === current.status) : [];
      return [fuel, {
        status: current?.status ?? null,
        queue: current?.queue ?? null,
        lastReportAt: current?.created_at ?? null,
        confirmations: new Set(sameStatus.map((r) => r.reporter_key)).size,
        conflict: current ? relevant.some((r) => r.status !== current.status) : false,
      }];
    }));
    return {
      id: station.id,
      name: station.name,
      district: station.district,
      area: station.area,
      latitude: station.latitude,
      longitude: station.longitude,
      status: latest?.status ?? null,
      fuel: latest?.fuel ?? null,
      queue: latest?.queue ?? null,
      lastReportAt: latest?.created_at ?? null,
      reportCount: recent.length,
      confirmations,
      conflict,
      fuelReports,
    };
  });

  return NextResponse.json({ stations });
}
