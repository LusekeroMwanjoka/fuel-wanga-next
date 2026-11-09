import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getStationAdminSession } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_FUELS = ["Petrol", "Diesel"];
const VALID_STATUSES = ["Available", "Low", "No fuel"];

export async function POST(request: NextRequest) {
  // Must be authenticated as a station admin
  const session = await getStationAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  // Rate limit: 30 updates per admin per hour
  const ip = clientIp(request);
  if (isRateLimited(`admin-update:${session.id}:${ip}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many updates. Please wait before posting again." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const fuel = typeof body?.fuel === "string" ? body.fuel : "";
  const status = typeof body?.status === "string" ? body.status : "";

  if (!VALID_FUELS.includes(fuel) || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Choose a valid fuel type and status." },
      { status: 400 },
    );
  }

  // The RPC enforces that admin_id matches station_id — prevents URL/payload tampering
  const { data, error } = await supabaseAdmin.rpc("submit_admin_update", {
    p_admin_id: session.id,
    p_station_id: session.station_id,
    p_fuel: fuel,
    p_status: status,
  });

  if (error?.message?.includes("ADMIN_NOT_AUTHORISED")) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }
  if (error || !data) {
    return NextResponse.json({ error: "Could not save your update." }, { status: 503 });
  }

  return NextResponse.json(data, { status: 201 });
}
