import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, setStationAdminSession } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Brute-force protection: 5 attempts per IP per 15 minutes
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

  const { data: admin } = await supabaseAdmin
    .from("station_admins")
    .select("id, password_hash, is_active, display_name, station_id")
    .eq("email", email)
    .single();

  // Constant-time: always verify even if not found (prevents user enumeration)
  const dummyHash = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const valid = await verifyPassword(password, admin?.password_hash ?? dummyHash);

  if (!admin || !valid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  if (!admin.is_active) {
    return NextResponse.json(
      { error: "This account has been disabled. Contact the super admin." },
      { status: 403 },
    );
  }

  await setStationAdminSession(admin.id);

  return NextResponse.json({
    ok: true,
    adminId: admin.id,
    stationId: admin.station_id,
    displayName: admin.display_name,
  });
}
