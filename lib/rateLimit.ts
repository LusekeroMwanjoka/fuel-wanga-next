import "server-only";

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: In a multi-instance / serverless deployment each instance has its own
 * map, so the limit is per-instance. For stricter enforcement, move to a shared
 * store (e.g. Supabase, Redis). For a community app at this scale this provides
 * a meaningful friction increase without added infrastructure.
 */

interface Bucket {
  count: number;
  /** Timestamp (ms) when this window resets */
  resetAt: number;
}

const store = new Map<string, Bucket>();

/**
 * Returns `true` when the caller has exceeded the rate limit, `false` otherwise.
 *
 * @param key      Unique identifier (IP, visitor ID, etc.)
 * @param limit    Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    // Start a fresh window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > limit) return true;
  return false;
}

/**
 * Extract the real client IP from a Next.js request, honouring common
 * reverse-proxy headers (Vercel, Cloudflare, etc.).
 */
export function clientIp(request: Request): string {
  const headers = [
    "x-real-ip",
    "cf-connecting-ip",          // Cloudflare
    "x-forwarded-for",           // standard proxy chain
    "x-vercel-forwarded-for",    // Vercel edge
  ];
  for (const header of headers) {
    const value = (request as { headers: { get(k: string): string | null } }).headers.get(header);
    if (value) return value.split(",")[0].trim();
  }
  return "unknown";
}
