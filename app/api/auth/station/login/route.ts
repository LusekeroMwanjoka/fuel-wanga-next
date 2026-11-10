import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { applyStationAdminSession } from "@/lib/auth";
import { signInWithSupabasePassword } from "@/lib/supabasePasswordAuth";
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

  const { data: authData, error: authError } = await signInWithSupabasePassword(email, password);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, role, station_id, display_name")
    .eq("id", authData.user.id)
    .single();
  if (profile?.role !== "station_admin" || !profile.station_id) {
    return NextResponse.json({ error: "This account is not a station admin." }, { status: 403 });
  }

  const { data: admin } = await getSupabaseAdmin()
    .from("station_admins")
    .select("id, auth_user_id, is_active, display_name, station_id, email")
    .eq("auth_user_id", authData.user.id)
    .eq("station_id", profile.station_id)
    .single();
  if (!admin) return NextResponse.json({ error: "Station admin account not found." }, { status: 403 });
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
  return applyStationAdminSession(res, authData.user.id);
}
