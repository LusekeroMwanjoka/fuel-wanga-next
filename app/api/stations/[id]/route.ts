import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isRateLimited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

/** Shared CORS guard: only allow same-origin mutations. */
function assertSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  // Reject cross-origin requests
  if (!assertSameOrigin(request))
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  // Rate limit: 5 renames per IP per 15 minutes
  const ip = clientIp(request);
  if (isRateLimited(`rename-station:${ip}`, 5, 15 * 60 * 1000))
    return NextResponse.json(
      { error: "Too many rename attempts. Please wait a moment before trying again." },
      { status: 429 },
    );

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name =
    typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";

  if (!isUuid(id) || name.length < 3 || name.length > 100)
    return NextResponse.json(
      { error: "Enter a station name between 3 and 100 characters." },
      { status: 400 },
    );

  const { data, error } = await supabaseAdmin.rpc("rename_station", {
    p_station_id: id,
    p_new_name: name,
  });

  if (error?.code === "23505")
    return NextResponse.json(
      { error: "Another station already uses this name in this district." },
      { status: 409 },
    );
  if (error?.message.includes("STATION_NOT_FOUND"))
    return NextResponse.json({ error: "Station not found." }, { status: 404 });
  if (error?.message.includes("DUPLICATE_STATION"))
    return NextResponse.json(
      { error: "Another station already uses this name in this district." },
      { status: 409 },
    );
  if (error || !data)
    return NextResponse.json(
      { error: "Could not update this station name." },
      { status: 503 },
    );

  return NextResponse.json(data);
}
