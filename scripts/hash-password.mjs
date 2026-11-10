/**
 * Run with: node scripts/hash-password.mjs yourpassword
 * Copy the output hash and paste it into the SQL below.
 */

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const ITERATIONS = 310_000;

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer, iterations: ITERATIONS, hash: "SHA-256" },
    base,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign"]
  );
  const hash = await crypto.subtle.exportKey("raw", key);
  const combined = new Uint8Array(16 + new Uint8Array(hash).length);
  combined.set(salt);
  combined.set(new Uint8Array(hash), 16);
  return btoa(String.fromCharCode(...combined));
}

const hash = await hashPassword(password);
console.log("\n✅ Password hash (copy this):\n");
console.log(hash);
console.log("\nSQL to insert super admin:");
console.log(`INSERT INTO public.super_admins (email, password_hash)`);
console.log(`VALUES ('your@email.com', '${hash}');`);
console.log("\nSQL to insert station admin:");
console.log(`INSERT INTO public.station_admins (email, password_hash, display_name, station_id)`);
console.log(`VALUES ('station@email.com', '${hash}', 'Admin Name', 'PASTE-STATION-UUID-HERE');`);
