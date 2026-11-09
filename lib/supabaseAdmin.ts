// Edge-compatible Supabase admin client.
// server-only is intentionally omitted — the edge runtime doesn't support it,
// but this module is only imported by server-side API routes (never client bundles).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/** Returns a singleton Supabase admin client using the service-role key. */
export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error(
      "Set SUPABASE_URL and SUPABASE_SECRET_KEY in the server environment.",
    );
  }

  _client = createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return _client;
}

// Convenience re-export so existing imports still work:
// `import { supabaseAdmin } from "@/lib/supabaseAdmin"`
// Routes that already use this name will keep working.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
