import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect admin dashboard paths
  if (path.startsWith("/admin/dashboard")) {
    const token = request.cookies.get("sb-access-token")?.value;
    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
