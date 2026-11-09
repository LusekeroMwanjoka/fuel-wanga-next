import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, setSuperAdminSession } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Strict brute-force protection: 3 attempts per IP per 30 minutes
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

  const { data: admin } = await supabaseAdmin
    .from("super_admins")
    .select("id, password_hash")
    .eq("email", email)
    .single();

  const dummyHash = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const valid = await verifyPassword(password, admin?.password_hash ?? dummyHash);

  if (!admin || !valid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await setSuperAdminSession(admin.id);
  return NextResponse.json({ ok: true });
}
