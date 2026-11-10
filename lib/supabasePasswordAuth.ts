import { createClient } from "@supabase/supabase-js";

/** Server-only password verification against Supabase Auth. */
export async function signInWithSupabasePassword(email: string, password: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return client.auth.signInWithPassword({ email, password });
}
