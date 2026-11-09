import { NextResponse } from "next/server";
import { clearSuperAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearSuperAdminSession();
  return NextResponse.json({ ok: true });
}
