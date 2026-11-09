import { NextResponse } from "next/server";
import { clearStationAdminCookie } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  return clearStationAdminCookie(res);
}
