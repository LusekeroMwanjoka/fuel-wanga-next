import { NextRequest, NextResponse } from "next/server";
import { STATION_ADMIN_COOKIE, SUPER_ADMIN_COOKIE } from "@/lib/authConstants";

export const config = {
  matcher: ["/admin/:path*", "/super/:path*"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Super-admin pages — require super admin cookie
  if (pathname.startsWith("/super") && !pathname.startsWith("/super/login")) {
    const token = request.cookies.get(SUPER_ADMIN_COOKIE)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/super/login";
      return NextResponse.redirect(url);
    }
  }

  // Station admin pages — require station admin cookie
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(STATION_ADMIN_COOKIE)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
