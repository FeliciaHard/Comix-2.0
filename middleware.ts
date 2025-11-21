// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value || null;

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const publicPaths = [
    "/api/mysql-config/route_landing", 
    "/signin", 
    "/signup", 
    "/api/auth/signin"
  ];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (token) {
    // If user is logged in, prevent access to signin or signup page
    if (pathname === "/signin" || pathname === "/signup") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } else {
    // If user is NOT logged in and tries to access protected pages
    if (!isPublicPath) {
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/telegram/:path*",
    "/comic-page/:path*",
    "/api/:path*",
    "/signin",
    "/signup",
  ],
};
