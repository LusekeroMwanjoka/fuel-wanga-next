import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, applyStationAdminSession } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (isRateLimited(`station-login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait before trying again." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const { data: admin } = await getSupabaseAdmin()
    .from("station_admins")
    .select("id, password_hash, is_active, display_name, station_id")
    .eq("email", email)
    .single();

  const dummy =
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const valid = await verifyPassword(password, admin?.password_hash ?? dummy);

  if (!admin || !valid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  if (!admin.is_active) {
    return NextResponse.json(
      { error: "This account has been disabled. Contact the super admin." },
      { status: 403 },
    );
  }

  const res = NextResponse.json({
    ok: true,
    adminId: admin.id,
    stationId: admin.station_id,
    displayName: admin.display_name,
  });
  return applyStationAdminSession(res, admin.id);
}
