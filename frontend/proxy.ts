import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy
 *
 * Auth cookies (accessToken / refreshToken) are set by the backend API on a
 * different domain (Render) so they are NOT visible to Vercel's edge.
 * All auth protection is handled client-side by the `useRequireAuth` hook.
 *
 * This proxy is a pass-through — kept as a placeholder so no stale
 * cached deployment causes redirect loops.
 */
export function proxy(_request: NextRequest) {
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
