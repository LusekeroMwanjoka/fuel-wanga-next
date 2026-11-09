// Edge-compatible in-memory rate limiter.
// server-only intentionally dropped — edge runtime doesn't support it.
// The store is per-isolate; in Cloudflare Workers each isolate is long-lived
// within a data-centre so the limiter still provides meaningful friction.

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function clientIp(request: Request): string {
  const headers = [
    "cf-connecting-ip",        // Cloudflare — most accurate
    "x-real-ip",
    "x-forwarded-for",
    "x-vercel-forwarded-for",
  ];
  for (const h of headers) {
    const v = request.headers.get(h);
    if (v) return v.split(",")[0].trim();
  }
  return "unknown";
}
