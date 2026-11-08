import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (!isUuid(id) || name.length < 3 || name.length > 100)
    return NextResponse.json({ error: "Enter a station name between 3 and 100 characters." }, { status: 400 });
  const { data, error } = await supabaseAdmin.rpc("rename_station", { p_station_id: id, p_new_name: name });
  if (error?.code === "23505") return NextResponse.json({ error: "Another station already uses this name in this district." }, { status: 409 });
  if (error?.message.includes("STATION_NOT_FOUND")) return NextResponse.json({ error: "Station not found." }, { status: 404 });
  if (error?.message.includes("DUPLICATE_STATION")) return NextResponse.json({ error: "Another station already uses this name in this district." }, { status: 409 });
  if (error || !data) return NextResponse.json({ error: "Could not update this station name." }, { status: 503 });
  return NextResponse.json(data);
}
