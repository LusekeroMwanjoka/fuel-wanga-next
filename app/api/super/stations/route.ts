import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSuperAdminSession } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSuperAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("stations")
    .select("id, name, district, area")
    .order("district")
    .order("name");

  if (error) return NextResponse.json({ error: "Could not load stations." }, { status: 503 });
  return NextResponse.json({ stations: data });
}
