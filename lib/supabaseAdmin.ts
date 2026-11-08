import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !secret) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in the server environment.");
}

// This client is only imported by server API routes. Never expose this key to the browser.
export const supabaseAdmin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
