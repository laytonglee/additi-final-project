"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";

// Module-level flag prevents duplicate fetchUser calls from
// React 18 StrictMode's double-effect invocation or any re-mount.
let _initialized = false;

export function AuthInitializer() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const didFetch = useRef(false);

  useEffect(() => {
    if (_initialized || didFetch.current) return;
    _initialized = true;
    didFetch.current = true;
    fetchUser();
  }, [fetchUser]);

  return null;
}
