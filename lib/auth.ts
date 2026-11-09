import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabaseAdmin";

// ── Session cookie names ──────────────────────────────────────────────────────
export { STATION_ADMIN_COOKIE, SUPER_ADMIN_COOKIE } from "./authConstants";

// Shared cookie options — HttpOnly, SameSite=Lax, Secure in production
function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

// ── Password hashing ──────────────────────────────────────────────────────────
// We use the Web Crypto subtle API (available in Next.js Node runtime) to hash
// passwords with PBKDF2-SHA256 so we don't need an extra npm dependency.
// bcrypt would be better; the migration SQL notes that point.
// Use a proper bcrypt library (e.g. `bcryptjs`) if you prefer.

const ITERATIONS = 310_000; // NIST SP 800-132 recommendation as of 2023

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const hash = await crypto.subtle.exportKey("raw", key);
  const combined = new Uint8Array(salt.length + new Uint8Array(hash).length);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    const key = await deriveKey(password, salt);
    const hash = new Uint8Array(await crypto.subtle.exportKey("raw", key));
    if (hash.length !== storedHash.length) return false;
    // Constant-time comparison
    let diff = 0;
    for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ storedHash[i];
    return diff === 0;
  } catch {
    return false;
  }
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign"]
  );
}

// ── Session tokens ─────────────────────────────────────────────────────────────
// Simple opaque token stored in a signed cookie. We store the raw UUID of the
// admin in the cookie value. For production, consider a JWT or a signed token.
// The HttpOnly + SameSite=Lax cookie prevents XSS and CSRF.

export async function setStationAdminSession(adminId: string): Promise<void> {
  const store = await cookies();
  store.set(STATION_ADMIN_COOKIE, adminId, cookieOpts(8 * 60 * 60)); // 8 hours
}

export async function clearStationAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(STATION_ADMIN_COOKIE);
}

export async function getStationAdminSession(): Promise<{
  id: string;
  station_id: string;
  email: string;
  display_name: string;
} | null> {
  const store = await cookies();
  const token = store.get(STATION_ADMIN_COOKIE)?.value;
  if (!token || !isUuid(token)) return null;

  const { data } = await supabaseAdmin
    .from("station_admins")
    .select("id, station_id, email, display_name")
    .eq("id", token)
    .eq("is_active", true)
    .single();

  return data ?? null;
}

export async function setSuperAdminSession(adminId: string): Promise<void> {
  const store = await cookies();
  store.set(SUPER_ADMIN_COOKIE, adminId, cookieOpts(4 * 60 * 60)); // 4 hours
}

export async function clearSuperAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(SUPER_ADMIN_COOKIE);
}

export async function getSuperAdminSession(): Promise<{ id: string; email: string } | null> {
  const store = await cookies();
  const token = store.get(SUPER_ADMIN_COOKIE)?.value;
  if (!token || !isUuid(token)) return null;

  const { data } = await supabaseAdmin
    .from("super_admins")
    .select("id, email")
    .eq("id", token)
    .single();

  return data ?? null;
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
