"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, AdminUserData, AdminStatsData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FolderOpen,
  FileText,
  Handshake,
  Ban,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

export default function AdminPage() {
  useRequireAuth("ADMIN");
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || !isAdmin()) return;
    const fetch = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getStats(),
        ]);
        setUsers(uRes.data.data);
        setStats(sRes.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [authLoading, user, isAdmin]);

  if (authLoading || !user || !isAdmin()) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4" />
      </div>
    );
  }

  const handleToggleBan = async (userId: number) => {
    try {
      await adminApi.toggleBan(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isBanned: !u.isBanned } : u,
        ),
      );
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div>
        <motion.h1
          className="text-3xl font-bold text-foreground mb-8"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Admin Panel
        </motion.h1>

        <Tabs defaultValue="overview">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="overview" className="mt-4">
            {stats && (
              <AnimatedList className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Users",
                    value: stats.totalUsers,
                    icon: Users,
                    color: "text-primary",
                  },
                  {
                    label: "Total Projects",
                    value: stats.totalProjects,
                    icon: FolderOpen,
                    color: "text-green-600",
                  },
                  {
                    label: "Total Proposals",
                    value: stats.totalProposals,
                    icon: FileText,
                    color: "text-yellow-600",
                  },
                  {
                    label: "Total Contracts",
                    value: stats.totalContracts,
                    icon: Handshake,
                    color: "text-blue-600",
                  },
                ].map((s) => (
                  <AnimatedItem key={s.label}>
                    <Card className="h-full">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <s.icon className={`size-5 ${s.color}`} />
                          <div>
                            <div className={`text-3xl font-bold ${s.color}`}>
                              {s.value}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {s.label}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedItem>
                ))}
              </AnimatedList>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="pl-6 font-medium">
                          {u.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {u.roles.map((r) => (
                              <Badge
                                key={r}
                                variant="secondary"
                                className="text-xs"
                              >
                                {r.replace("ROLE_", "")}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.isBanned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="bg-green-600 hover:bg-green-600"
                            >
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={u.isBanned ? "outline" : "destructive"}
                            onClick={() => handleToggleBan(u.id)}
                          >
                            {u.isBanned ? (
                              <>
                                <ShieldCheck className="mr-1 size-3.5" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="mr-1 size-3.5" />
                                Ban
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
