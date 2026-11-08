import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { districts } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const validDistrict = (name: string) => districts.some(d => d.name.toLowerCase() === name.toLowerCase());

export async function GET(request: NextRequest) {
  const district = request.nextUrl.searchParams.get("district");
  let query = supabaseAdmin.from("stations").select("id,name,district,area,created_at").order("name");
  if (district && validDistrict(district)) query = query.ilike("district", district);
  const { data: stationRows, error: stationError } = await query;
  if (stationError) return NextResponse.json({ error: "Could not load stations." }, { status: 503 });
  const rows = stationRows ?? [];
  if (!rows.length) return NextResponse.json({ stations: [] });

  const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const { data: reports, error: reportError } = await supabaseAdmin.from("reports")
    .select("station_id,fuel,status,queue,reporter_key,created_at")
    .in("station_id", rows.map(station => station.id)).gte("created_at", cutoff)
    .order("created_at", { ascending: false }).limit(3000);
  if (reportError) return NextResponse.json({ error: "Could not load recent reports." }, { status: 503 });

  const byStation = new Map<string, NonNullable<typeof reports>>();
  for (const report of reports ?? []) {
    const list = byStation.get(report.station_id) ?? [];
    list.push(report); byStation.set(report.station_id, list);
  }
  const stations = rows.map(station => {
    const recent = byStation.get(station.id) ?? [];
    const latest = recent[0];
    const matching = latest ? recent.filter(r => r.fuel === latest.fuel && r.status === latest.status) : [];
    const confirmations = new Set(matching.map(r => r.reporter_key)).size;
    const conflict = latest ? recent.some(r => r.fuel === latest.fuel && r.status !== latest.status) : false;
    return {
      id: station.id, name: station.name, district: station.district, area: station.area,
      status: latest?.status ?? null, fuel: latest?.fuel ?? null, queue: latest?.queue ?? null,
      lastReportAt: latest?.created_at ?? null, reportCount: recent.length, confirmations, conflict,
    };
  });
  return NextResponse.json({ stations });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const district = typeof body?.district === "string" ? body.district.trim() : "";
  const area = typeof body?.area === "string" ? body.area.trim().replace(/\s+/g, " ") : "";
  if (name.length < 3 || name.length > 100 || area.length > 100 || !validDistrict(district))
    return NextResponse.json({ error: "Enter a station name and choose one of the 28 districts." }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("stations")
    .insert({ name, district, area: area || district }).select("id,name,district,area,created_at").single();
  if (error?.code === "23505") return NextResponse.json({ error: "A station with this name is already listed in this district." }, { status: 409 });
  if (error || !data) return NextResponse.json({ error: "Could not add this station." }, { status: 503 });
  return NextResponse.json({ id: data.id, name: data.name, district: data.district, area: data.area, createdAt: data.created_at, status: null, fuel: null, queue: null, lastReportAt: null, reportCount: 0, confirmations: 0, conflict: false }, { status: 201 });
}
