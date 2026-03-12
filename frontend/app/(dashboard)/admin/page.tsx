"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, AdminStatsData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FolderOpen,
  FileText,
  Handshake,
  ArrowRight,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

export default function AdminPage() {
  useRequireAuth("ADMIN");
  const { user, loading: authLoading, isAdmin } = useAuthStore();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const avgProjectsPerUser = stats
    ? (stats.totalUsers > 0 ? stats.totalProjects / stats.totalUsers : 0)
    : 0;
  const avgProposalsPerProject = stats
    ? (stats.totalProjects > 0 ? stats.totalProposals / stats.totalProjects : 0)
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4" />
      </div>
    );
  }

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
          Overview
        </motion.h1>

        {stats && (
          <div className="space-y-8">
            <AnimatedList className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <Card>
                <CardContent className="space-y-5 pt-6">
                  <div>
                    <h2 className="text-xl font-semibold">Admin Workspace</h2>
                    <p className="text-sm text-muted-foreground">
                      Jump directly into moderation and platform maintenance.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        href: "/admin/users",
                        title: "Review users",
                        description: "Moderate accounts and manage bans.",
                        icon: Users,
                      },
                      {
                        href: "/admin/projects",
                        title: "Review projects",
                        description: "Inspect listings and remove problematic posts.",
                        icon: ShieldCheck,
                      },
                      {
                        href: "/admin/categories",
                        title: "Manage categories",
                        description: "Keep marketplace structure clean and current.",
                        icon: Tag,
                      },
                    ].map((item) => (
                      <Link key={item.href} href={item.href}>
                        <div className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
                          <item.icon className="mb-3 size-5 text-primary" />
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                            Open
                            <ArrowRight className="size-4" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-5 pt-6">
                  <div>
                    <h2 className="text-xl font-semibold">Platform Health</h2>
                    <p className="text-sm text-muted-foreground">
                      Quick derived signals from current marketplace activity.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Projects per user</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {avgProjectsPerUser.toFixed(1)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Proposals per project</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {avgProposalsPerProject.toFixed(1)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Recommended focus</p>
                      <p className="mt-1 text-sm leading-6 text-foreground">
                        Review user activity, audit project quality, and keep categories aligned with marketplace demand.
                      </p>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href="/admin/projects">
                      Open moderation queue
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
