import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSuperAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: all stations (for super admin — no district filter)
export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("stations")
    .select("id, name, district, area")
    .order("district")
    .order("name");

  if (error) return NextResponse.json({ error: "Could not load stations." }, { status: 503 });
  return NextResponse.json({ stations: data });
}
