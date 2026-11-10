import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { applySuperAdminSession } from "@/lib/auth";
import { signInWithSupabasePassword } from "@/lib/supabasePasswordAuth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (isRateLimited(`super-login:${ip}`, 3, 30 * 60 * 1000)) {
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
    .select("role")
    .eq("id", authData.user.id)
    .single();
  if (profile?.role !== "super_admin") {
    return NextResponse.json({ error: "This account is not a super admin." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  return applySuperAdminSession(res, authData.user.id);
}
