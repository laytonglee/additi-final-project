"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

/**
 * Redirects unauthenticated users to /login.
 * Optionally accepts a required role ("CLIENT" | "FREELANCER" | "ADMIN").
 * Returns { user, loading } so the page can show a loading state.
 */
export function useRequireAuth(requiredRole?: string) {
  const { user, loading, hasRole } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // wait until auth state is resolved

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.replace("/");
    }
  }, [user, loading, requiredRole, router, hasRole, pathname]);

  return { user, loading };
}
