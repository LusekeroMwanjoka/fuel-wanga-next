import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const fuels = ["Petrol", "Diesel", "Both"];
const statuses = ["Available", "Low", "No fuel"];
const queues = ["No queue update", "No queue", "Short queue", "Medium queue", "Long queue"];
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function POST(request: NextRequest, { params }: Context) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const reporter = request.headers.get("x-visitor-id") || "";
  if (!isUuid(id) || !isUuid(reporter)) return NextResponse.json({ error: "Please refresh and try again." }, { status: 400 });
  if (!fuels.includes(body?.fuel) || !statuses.includes(body?.status) || !queues.includes(body?.queue))
    return NextResponse.json({ error: "Choose a fuel type, fuel status and queue." }, { status: 400 });
  const { data, error } = await supabaseAdmin.rpc("submit_station_report", {
    p_station_id: id, p_fuel: body.fuel, p_status: body.status, p_queue: body.queue, p_reporter_key: reporter,
  });
  if (error?.message.includes("REPORT_RATE_LIMIT")) return NextResponse.json({ error: "You already shared an update here. Please wait 15 minutes before reporting again." }, { status: 429 });
  if (error?.message.includes("STATION_NOT_FOUND")) return NextResponse.json({ error: "Station not found." }, { status: 404 });
  if (error || !data) return NextResponse.json({ error: "Could not save your report." }, { status: 503 });
  return NextResponse.json(data, { status: 201 });
}
