"use client";

import { useEffect } from "react";
import { notificationApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useNotificationStore } from "@/store/notifications";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const count = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (loading || !user) return;

    const fetchCount = async () => {
      try {
        const res = await notificationApi.unreadCount();
        setUnreadCount(res.data.data);
      } catch {
        /* ignore */
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user, loading, setUnreadCount]);

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/notifications">
        <Bell className="size-5" />
        {count > 0 && (
          <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center rounded-full p-0 text-[10px]">
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
