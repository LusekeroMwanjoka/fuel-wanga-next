import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSuperAdminSession, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSuper() {
  const session = await getSuperAdminSession();
  if (!session) return null;
  return session;
}

// GET: list all station admins with their station info
export async function GET() {
  if (!await requireSuper()) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("station_admins")
    .select("id, email, display_name, is_active, created_at, station_id, stations(id, name, district)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Could not load admins." }, { status: 503 });
  return NextResponse.json({ admins: data });
}

// POST: create a new station admin account
export async function POST(request: NextRequest) {
  if (!await requireSuper()) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const stationId = typeof body?.stationId === "string" ? body.stationId.trim() : "";

  if (!email || !password || !stationId) {
    return NextResponse.json(
      { error: "Email, password and station are required." },
      { status: 400 },
    );
  }
  if (password.length < 10) {
    return NextResponse.json(
      { error: "Password must be at least 10 characters." },
      { status: 400 },
    );
  }

  // Verify station exists
  const { data: station } = await supabaseAdmin
    .from("stations")
    .select("id")
    .eq("id", stationId)
    .single();
  if (!station) {
    return NextResponse.json({ error: "Station not found." }, { status: 404 });
  }

  const passwordHash = await hashPassword(password);

  const { data, error } = await supabaseAdmin
    .from("station_admins")
    .insert({ email, password_hash: passwordHash, display_name: displayName || email, station_id: stationId })
    .select("id, email, display_name, is_active, station_id")
    .single();

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "An admin with this email already exists." },
      { status: 409 },
    );
  }
  if (error || !data) {
    return NextResponse.json({ error: "Could not create admin account." }, { status: 503 });
  }

  return NextResponse.json({ admin: data }, { status: 201 });
}
