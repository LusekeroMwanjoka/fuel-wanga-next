// Edge-compatible auth helpers.
// server-only intentionally dropped — edge runtime doesn't support it.
// cookies() from next/headers is NOT available on the edge runtime, so session
// reads use request.cookies and session writes return a Set-Cookie header value.

import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabaseAdmin";

export { STATION_ADMIN_COOKIE, SUPER_ADMIN_COOKIE } from "./authConstants";
import { STATION_ADMIN_COOKIE, SUPER_ADMIN_COOKIE } from "./authConstants";

// ── Cookie option helpers ────────────────────────────────────────────────────
function cookieString(
  name: string,
  value: string,
  maxAge: number,
): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/${secure}; Max-Age=${maxAge}`;
}

function deleteCookieString(name: string): string {
  return `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

// ── Set helpers (add Set-Cookie to an existing NextResponse) ─────────────────
export function applyStationAdminSession(
  response: NextResponse,
  adminId: string,
): NextResponse {
  response.headers.append(
    "Set-Cookie",
    cookieString(STATION_ADMIN_COOKIE, adminId, 8 * 60 * 60),
  );
  return response;
}

export function clearStationAdminCookie(response: NextResponse): NextResponse {
  response.headers.append(
    "Set-Cookie",
    deleteCookieString(STATION_ADMIN_COOKIE),
  );
  return response;
}

export function applySuperAdminSession(
  response: NextResponse,
  adminId: string,
): NextResponse {
  response.headers.append(
    "Set-Cookie",
    cookieString(SUPER_ADMIN_COOKIE, adminId, 4 * 60 * 60),
  );
  return response;
}

export function clearSuperAdminCookie(response: NextResponse): NextResponse {
  response.headers.append(
    "Set-Cookie",
    deleteCookieString(SUPER_ADMIN_COOKIE),
  );
  return response;
}

// ── Read helpers (read from NextRequest) ─────────────────────────────────────
export async function getStationAdminSession(request: NextRequest): Promise<{
  id: string;
  station_id: string;
  email: string;
  display_name: string;
} | null> {
  const token = request.cookies.get(STATION_ADMIN_COOKIE)?.value;
  if (!token || !isUuid(token)) return null;

  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, role, station_id, display_name")
    .eq("id", token)
    .eq("role", "station_admin")
    .single();
  if (!profile?.station_id) return null;

  const { data } = await getSupabaseAdmin()
    .from("station_admins")
    .select("id, station_id, email, display_name")
    .eq("auth_user_id", token)
    .eq("station_id", profile.station_id)
    .eq("is_active", true)
    .single();

  if (!data) return null;
  const { data: station } = await getSupabaseAdmin()
    .from("stations")
    .select("id")
    .eq("id", data.station_id)
    .eq("is_active", true)
    .maybeSingle();
  return station ? data : null;
}

export async function getSuperAdminSession(
  request: NextRequest,
): Promise<{ id: string; email: string } | null> {
  const token = request.cookies.get(SUPER_ADMIN_COOKIE)?.value;
  if (!token || !isUuid(token)) return null;

  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, role")
    .eq("id", token)
    .eq("role", "super_admin")
    .single();

  if (!profile) return null;
  const { data: userData } = await getSupabaseAdmin().auth.admin.getUserById(token);
  return userData.user ? { id: token, email: userData.user.email ?? "" } : null;
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
