"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, AdminStatsData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FolderOpen,
  FileText,
  Handshake,
  ArrowRight,
  ShieldCheck,
  Tag,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{title}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  useRequireAuth("ADMIN");
  const { user, loading: authLoading, isAdmin } = useAuthStore();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const avgProjectsPerUser =
    stats && stats.totalUsers > 0
      ? stats.totalProjects / stats.totalUsers
      : 0;
  const avgProposalsPerProject =
    stats && stats.totalProjects > 0
      ? stats.totalProposals / stats.totalProjects
      : 0;
  const contractRate =
    stats && stats.totalProposals > 0
      ? (stats.totalContracts / stats.totalProposals) * 100
      : 0;

  useEffect(() => {
    if (authLoading || !user || !isAdmin()) return;
    const fetch = async () => {
      try {
        const sRes = await adminApi.getStats();
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
      <div className="w-full space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      href: "/admin/users",
      title: "Manage Users",
      desc: "Review, ban, and control user accounts.",
      icon: Users,
    },
    {
      href: "/admin/projects",
      title: "Moderate Projects",
      desc: "Inspect and remove problematic listings.",
      icon: ShieldCheck,
    },
    {
      href: "/admin/categories",
      title: "Categories",
      desc: "Organize and maintain marketplace structure.",
      icon: Tag,
    },
  ];

  return (
    <PageTransition>
      <div>
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button asChild>
              <Link href="/admin/projects">
                <ShieldCheck className="mr-2 size-4" />
                Moderation Queue
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <AnimatedList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: stats!.totalUsers,
              icon: <Users className="size-5 text-blue-600" />,
            },
            {
              label: "Total Projects",
              value: stats!.totalProjects,
              icon: <FolderOpen className="size-5 text-green-600" />,
            },
            {
              label: "Total Proposals",
              value: stats!.totalProposals,
              icon: <FileText className="size-5 text-yellow-600" />,
            },
            {
              label: "Total Contracts",
              value: stats!.totalContracts,
              icon: <Handshake className="size-5 text-primary" />,
            },
          ].map((s) => (
            <AnimatedItem key={s.label}>
              <StatCard title={s.label} value={s.value} icon={s.icon} />
            </AnimatedItem>
          ))}
        </AnimatedList>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs defaultValue="actions">
            <TabsList>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              <TabsTrigger value="insights">Platform Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="mt-4">
              <AnimatedList className="space-y-3">
                {quickActions.map((item) => (
                  <AnimatedItem key={item.href}>
                    <Link href={item.href}>
                      <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                        <CardContent>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="rounded-xl bg-muted p-2.5">
                                <item.icon className="size-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </AnimatedItem>
                ))}
              </AnimatedList>
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <AnimatedList className="space-y-3">
                {[
                  {
                    label: "Projects per User",
                    value: avgProjectsPerUser.toFixed(1),
                    icon: <FolderOpen className="size-5 text-green-600" />,
                  },
                  {
                    label: "Proposals per Project",
                    value: avgProposalsPerProject.toFixed(1),
                    icon: <FileText className="size-5 text-yellow-600" />,
                  },
                  {
                    label: "Contract Rate",
                    value: stats!.totalProposals > 0 ? `${contractRate.toFixed(0)}%` : "—",
                    icon: <TrendingUp className="size-5 text-primary" />,
                  },
                  {
                    label: "Avg Proposals Reviewed",
                    value: (stats!.totalProposals + stats!.totalContracts).toLocaleString(),
                    icon: <BarChart2 className="size-5 text-blue-600" />,
                  },
                ].map((item) => (
                  <AnimatedItem key={item.label}>
                    <Card>
                      <CardContent>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-muted p-2.5">
                              {item.icon}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.label}
                            </p>
                          </div>
                          <span className="text-2xl font-bold">
                            {item.value}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedItem>
                ))}
              </AnimatedList>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  );
}
