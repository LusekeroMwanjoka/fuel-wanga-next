import { NextResponse } from "next/server";
import { clearStationAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearStationAdminSession();
  return NextResponse.json({ ok: true });
}
