import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware
 *
 * NOTE: Auth cookies (accessToken / refreshToken) are set by the backend API
 * on a different domain (e.g. Render) so they are NOT visible to Vercel's
 * edge middleware. All auth protection is handled client-side by the
 * `useRequireAuth` hook in each protected page.
 *
 * This middleware is intentionally a no-op pass-through.
 * It exists so that no stale middleware from a previous deployment can
 * intercept requests and cause redirect loops.
 */
export function middleware(_request: NextRequest) {
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
