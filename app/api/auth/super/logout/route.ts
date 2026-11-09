import { NextResponse } from "next/server";
import { clearSuperAdminCookie } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  return clearSuperAdminCookie(res);
}
