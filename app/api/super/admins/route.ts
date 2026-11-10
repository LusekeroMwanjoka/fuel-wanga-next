import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSuperAdminSession } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSuperAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("station_admins")
    .select("id, email, display_name, is_active, created_at, station_id, stations(id, name, district)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Could not load admins." }, { status: 503 });
  return NextResponse.json({ admins: data });
}

export async function POST(request: NextRequest) {
  const session = await getSuperAdminSession(request);
  if (!session) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const stationId = typeof body?.stationId === "string" ? body.stationId.trim() : "";

  if (!email || !stationId) {
    return NextResponse.json(
      { error: "Email and station are required." },
      { status: 400 },
    );
  }

  const { data: station } = await getSupabaseAdmin()
    .from("stations")
    .select("id")
    .eq("id", stationId)
    .single();
  if (!station) return NextResponse.json({ error: "Station not found." }, { status: 404 });

  const supabase = getSupabaseAdmin();
  const { data: users, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return NextResponse.json({ error: "Could not check Auth users." }, { status: 503 });
  let authUser = users.users.find((user) => user.email?.toLowerCase() === email);
  let invited = false;
  let previousProfile: { role: string; station_id: string | null; display_name: string } | null = null;
  if (authUser) {
    const { data: existingProfile } = await supabase.from("profiles").select("role, station_id, display_name").eq("id", authUser.id).maybeSingle();
    previousProfile = existingProfile;
    if (existingProfile?.role === "super_admin") {
      return NextResponse.json({ error: "This email belongs to a super admin." }, { status: 409 });
    }
    const { data: existingAdmin } = await supabase.from("station_admins").select("id").eq("auth_user_id", authUser.id).maybeSingle();
    if (existingAdmin) return NextResponse.json({ error: "An admin with this email already exists." }, { status: 409 });
  } else {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: siteUrl ? `${siteUrl.replace(/\/$/, "")}/admin/login` : undefined,
      data: { display_name: displayName || email },
    });
    if (inviteError || !inviteData.user) {
      return NextResponse.json({ error: inviteError?.message ?? "Could not invite Auth user." }, { status: 503 });
    }
    authUser = inviteData.user;
    invited = true;
  }

  if (invited) {
    const { data: createdProfile } = await supabase.from("profiles").select("role, station_id, display_name").eq("id", authUser.id).maybeSingle();
    previousProfile = createdProfile;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authUser.id, role: "station_admin", station_id: stationId, display_name: displayName || email,
  });
  if (profileError) {
    if (invited) await supabase.auth.admin.deleteUser(authUser.id);
    return NextResponse.json({ error: "Could not assign the station admin role." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("station_admins")
    .insert({ auth_user_id: authUser.id, email, display_name: displayName || email, station_id: stationId })
    .select("id, email, display_name, is_active, station_id")
    .single();

  if (error?.code === "23505") {
    if (previousProfile) await supabase.from("profiles").upsert({ id: authUser.id, ...previousProfile });
    else await supabase.from("profiles").delete().eq("id", authUser.id);
    if (invited) await supabase.auth.admin.deleteUser(authUser.id);
    return NextResponse.json(
      { error: "An admin with this email already exists." },
      { status: 409 },
    );
  }
  if (error || !data) {
    if (invited) await supabase.auth.admin.deleteUser(authUser.id);
    if (previousProfile) await supabase.from("profiles").upsert({ id: authUser.id, ...previousProfile });
    else await supabase.from("profiles").delete().eq("id", authUser.id);
    return NextResponse.json({ error: "Could not create admin account." }, { status: 503 });
  }

  return NextResponse.json({ admin: data }, { status: 201 });
}
