import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (redirect to /login if not authed)
const protectedPrefixes = [
  "/post-project",
  "/client",
  "/freelancer",
  "/contracts",
  "/settings",
  "/notifications",
];

// Routes only for guests (redirect to / if already authed)
const guestOnly = ["/login", "/register"];

// Admin routes
const adminPrefixes = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // If accessing protected routes without token → redirect to login
  if (!accessToken) {
    const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
    const isAdmin = adminPrefixes.some((p) => pathname.startsWith(p));
    if (isProtected || isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // If accessing guest-only routes with token → redirect to home
  if (accessToken && guestOnly.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/post-project/:path*",
    "/client/:path*",
    "/freelancer/:path*",
    "/contracts/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
