import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSuperAdminSession } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ adminId: string }> };

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export async function PATCH(request: NextRequest, { params }: Context) {
  const session = await getSuperAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { adminId } = await params;
  if (!isUuid(adminId)) return NextResponse.json({ error: "Invalid admin ID." }, { status: 400 });

  const body = await request.json().catch(() => null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { updated_at: new Date().toISOString() };

  if (typeof body?.displayName === "string") update.display_name = body.displayName.trim();
  if (typeof body?.isActive === "boolean") update.is_active = body.isActive;
  if (typeof body?.stationId === "string") {
    const { data: st } = await getSupabaseAdmin().from("stations").select("id").eq("id", body.stationId).eq("is_active", true).single();
    if (!st) return NextResponse.json({ error: "Station not found." }, { status: 404 });
    update.station_id = body.stationId;
  }
  const newPassword = typeof body?.password === "string" ? body.password : null;
  if (newPassword !== null && newPassword.length < 10)
    return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: currentAdmin } = await supabase.from("station_admins").select("auth_user_id").eq("id", adminId).single();
  if (!currentAdmin) return NextResponse.json({ error: "Admin not found." }, { status: 404 });
  if (newPassword !== null) {
    if (!currentAdmin.auth_user_id) return NextResponse.json({ error: "Admin has no linked Auth user." }, { status: 409 });
    const { error: passwordError } = await supabase.auth.admin.updateUserById(currentAdmin.auth_user_id, { password: newPassword });
    if (passwordError) return NextResponse.json({ error: "Could not update the Auth password." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("station_admins")
    .update(update)
    .eq("id", adminId)
    .select("id, email, display_name, is_active, station_id")
    .single();

  if (error?.code === "PGRST116") return NextResponse.json({ error: "Admin not found." }, { status: 404 });
  if (error || !data) return NextResponse.json({ error: "Could not update admin account." }, { status: 503 });

  if (typeof body?.displayName === "string" || typeof body?.stationId === "string") {
    await supabase.from("profiles").update({
      ...(typeof body?.displayName === "string" ? { display_name: body.displayName.trim() } : {}),
      ...(typeof body?.stationId === "string" ? { station_id: body.stationId } : {}),
    }).eq("id", currentAdmin.auth_user_id);
  }
  return NextResponse.json({ admin: data });
}
