"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notificationApi, NotificationData, PageData } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useNotificationStore } from "@/store/notifications";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

function getNotificationLink(
  n: NotificationData,
  isClient: boolean,
  isFreelancer: boolean,
): string | null {
  const { referenceType, referenceId, type } = n;
  if (type === "NEW_MESSAGE" || referenceType === "MESSAGE") return "/messages";
  if (referenceType === "CONTRACT") return `/contracts/${referenceId}`;
  if (referenceType === "PROJECT") {
    if (isClient) return `/client/projects/${referenceId}`;
    if (isFreelancer) return `/freelancer/projects/${referenceId}`;
    return `/projects/${referenceId}`;
  }
  if (referenceType === "PROPOSAL") return "/messages";
  return null;
}

export default function NotificationsPage() {
  useRequireAuth();
  const router = useRouter();
  const { isClient, isFreelancer } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  const fetchData = async (p = 0) => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll(p, 6);
      const data = res.data.data as PageData<NotificationData>;
      setNotifications(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      decrementUnread();
    } catch {
      /* ignore */
    }
  };

  const handleNotificationClick = async (n: NotificationData) => {
    if (!n.isRead) await handleMarkRead(n.id);
    const link = getNotificationLink(n, isClient(), isFreelancer());
    if (link) router.push(link);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      // Re-fetch the current page so all cards reflect the updated isRead state
      await fetchData(page);
    } catch {
      /* ignore */
    }
  };

  const getIconForType = (type: string) => {
    const icons: Record<string, string> = {
      NEW_PROPOSAL: "📨",
      PROPOSAL_ACCEPTED: "✅",
      PROPOSAL_REJECTED: "❌",
      CONTRACT_STARTED: "📝",
      CONTRACT_COMPLETED: "🎉",
      NEW_REVIEW: "⭐",
      NEW_MESSAGE: "💬",
      USER_BANNED: "🚫",
      USER_UNBANNED: "🔓",
    };
    return icons[type] || "🔔";
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto ">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            className="text-center py-20 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No notifications yet.
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            <AnimatePresence>
              {notifications.map((n) => {
                const link = getNotificationLink(n, isClient(), isFreelancer());
                return (
                  <motion.div
                    key={n.id}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.3 },
                      },
                    }}
                    layout
                  >
                    <Card
                      onClick={() => handleNotificationClick(n)}
                      className={`transition-all hover:shadow-sm ${
                        link ? "cursor-pointer" : "cursor-default"
                      } ${!n.isRead ? "border-primary/30 bg-primary/5" : ""}`}
                    >
                      <CardContent className="">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">
                            {getIconForType(n.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-sm font-medium ${
                                  n.isRead
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {n.title}
                              </h3>
                              {!n.isRead && (
                                <span className="size-2 bg-primary rounded-full shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {n.body}
                            </p>
                            <div className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {totalPages > 1 && (
          <motion.div
            className="flex justify-center items-center gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
