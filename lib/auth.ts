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

  const { data } = await getSupabaseAdmin()
    .from("station_admins")
    .select("id, station_id, email, display_name")
    .eq("id", token)
    .eq("is_active", true)
    .single();

  return data ?? null;
}

export async function getSuperAdminSession(
  request: NextRequest,
): Promise<{ id: string; email: string } | null> {
  const token = request.cookies.get(SUPER_ADMIN_COOKIE)?.value;
  if (!token || !isUuid(token)) return null;

  const { data } = await getSupabaseAdmin()
    .from("super_admins")
    .select("id, email")
    .eq("id", token)
    .single();

  return data ?? null;
}

// ── Password hashing — Web Crypto (works on both Node and Edge) ──────────────
const ITERATIONS = 310_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const hash = await crypto.subtle.exportKey("raw", key);
  const combined = new Uint8Array(16 + new Uint8Array(hash).length);
  combined.set(salt);
  combined.set(new Uint8Array(hash), 16);
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  try {
    const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    const key = await deriveKey(password, salt);
    const hash = new Uint8Array(await crypto.subtle.exportKey("raw", key));
    if (hash.length !== storedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ storedHash[i];
    return diff === 0;
  } catch {
    return false;
  }
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as ArrayBuffer, iterations: ITERATIONS, hash: "SHA-256" },
    base,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign"],
  );
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
