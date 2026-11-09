import { NextRequest, NextResponse } from "next/server";
import { getStationAdminSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getStationAdminSession(request);
  if (!session) return NextResponse.json({ admin: null });

  const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  const [{ data: station }, { data: updates }] = await Promise.all([
    getSupabaseAdmin()
      .from("stations")
      .select("id, name, district, area")
      .eq("id", session.station_id)
      .single(),
    getSupabaseAdmin()
      .from("admin_updates")
      .select("id, fuel, status, created_at")
      .eq("station_id", session.station_id)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    admin: {
      id: session.id,
      email: session.email,
      displayName: session.display_name,
      station,
      activeUpdates: updates ?? [],
    },
  });
}
