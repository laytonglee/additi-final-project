"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { messageApi, ConversationSummaryData } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MessagesPage() {
  const { loading: authLoading } = useRequireAuth();
  const [conversations, setConversations] = useState<ConversationSummaryData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetch = async () => {
      try {
        const res = await messageApi.getConversations();
        setConversations(res.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [authLoading]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto ">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading
                ? "Loading…"
                : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}${
                    totalUnread > 0 ? ` · ${totalUnread} unread` : ""
                  }`}
            </p>
          </div>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {totalUnread} unread
            </Badge>
          )}
        </motion.div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Skeleton className="size-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && conversations.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <MessageCircle className="size-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm mt-1">
              Messages appear here once a contract is started.
            </p>
          </motion.div>
        )}

        {/* Conversation list */}
        {!loading && conversations.length > 0 && (
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {conversations.map((conv) => (
              <motion.div
                key={conv.contractId}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                }}
              >
                <Link href={`/contracts/${conv.contractId}`} className="block">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="size-12">
                          {conv.otherUserAvatarUrl && (
                            <AvatarImage
                              src={conv.otherUserAvatarUrl}
                              alt={conv.otherUserName}
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {conv.otherUserName?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-destructive border-2 border-background" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-semibold truncate ${
                              conv.unreadCount > 0
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {conv.otherUserName}
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(conv.lastMessageAt)}
                            </span>

                            {conv.contractStatus === "COMPLETED" && (
                              <Badge variant="secondary" className="text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          📁 {conv.projectTitle}
                        </p>
                        <p
                          className={`text-sm truncate mt-1 ${
                            conv.unreadCount > 0
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {conv.lastMessageBody ?? (
                            <span className="italic">No messages yet</span>
                          )}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="shrink-0 rounded-full px-2 py-0.5 text-xs"
                        >
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
