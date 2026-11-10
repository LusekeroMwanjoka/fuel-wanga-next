import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSuperAdminSession } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSuperAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("stations")
    .select("id, name, district, area, is_active")
    .order("district")
    .order("name");

  if (error) return NextResponse.json({ error: "Could not load stations." }, { status: 503 });
  return NextResponse.json({ stations: data });
}

export async function PATCH(request: NextRequest) {
  const session = await getSuperAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const stationId = typeof body?.stationId === "string" ? body.stationId : "";
  if (!stationId || typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "Station and active status are required." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("stations")
    .update({ is_active: body.isActive, updated_at: new Date().toISOString() })
    .eq("id", stationId)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not update station." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Station not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSuperAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const stationId = typeof body?.stationId === "string" ? body.stationId : "";
  if (!stationId) return NextResponse.json({ error: "Station is required." }, { status: 400 });

  const { error } = await getSupabaseAdmin().rpc("delete_station_if_unused", { p_station_id: stationId });
  if (error?.message.includes("STATION_IN_USE")) {
    return NextResponse.json({ error: "This station has reports or admin records and cannot be deleted. Deactivate it to hide it while keeping its history." }, { status: 409 });
  }
  if (error?.message.includes("STATION_NOT_FOUND")) return NextResponse.json({ error: "Station not found." }, { status: 404 });
  if (error) return NextResponse.json({ error: "Could not delete station." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
