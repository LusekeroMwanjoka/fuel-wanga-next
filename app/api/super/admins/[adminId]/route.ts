import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSuperAdminSession, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ adminId: string }> };

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

async function requireSuper() {
  const session = await getSuperAdminSession();
  return session ?? null;
}

// PATCH: update display name, active status, password, or station assignment
export async function PATCH(request: NextRequest, { params }: Context) {
  if (!await requireSuper()) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { adminId } = await params;
  if (!isUuid(adminId)) {
    return NextResponse.json({ error: "Invalid admin ID." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { updated_at: new Date().toISOString() };

  if (typeof body?.displayName === "string") update.display_name = body.displayName.trim();
  if (typeof body?.isActive === "boolean") update.is_active = body.isActive;
  if (typeof body?.stationId === "string") {
    // Verify station exists
    const { data: st } = await supabaseAdmin.from("stations").select("id").eq("id", body.stationId).single();
    if (!st) return NextResponse.json({ error: "Station not found." }, { status: 404 });
    update.station_id = body.stationId;
  }
  if (typeof body?.password === "string") {
    if (body.password.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
    }
    update.password_hash = await hashPassword(body.password);
  }

  const { data, error } = await supabaseAdmin
    .from("station_admins")
    .update(update)
    .eq("id", adminId)
    .select("id, email, display_name, is_active, station_id")
    .single();

  if (error?.code === "PGRST116") {
    return NextResponse.json({ error: "Admin not found." }, { status: 404 });
  }
  if (error || !data) {
    return NextResponse.json({ error: "Could not update admin account." }, { status: 503 });
  }

  return NextResponse.json({ admin: data });
}
