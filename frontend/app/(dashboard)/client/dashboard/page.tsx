"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectApi, contractApi, ProjectData, ContractData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderOpen, Clock, CheckCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

const listItemVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ClientDashboardPage() {
  useRequireAuth("CLIENT");
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [projRes, contRes] = await Promise.all([
          projectApi.getAll(0, 50),
          contractApi.getMy(),
        ]);
        const ownProjects = projRes.data.data.content.filter(
          (p) => p.clientId === user?.id,
        );
        setProjects(ownProjects);
        setContracts(contRes.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  const stats = {
    open: projects.filter((p) => p.status === "OPEN").length,
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    activeContracts: contracts.filter((c) => c.status === "ACTIVE").length,
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/3" />
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
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Client Dashboard
          </h1>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button asChild>
              <Link href="/post-project">
                <Plus className="mr-2 size-4" />
                New Project
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <AnimatedList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Open Projects",
              value: stats.open,
              icon: FolderOpen,
              color: "text-green-600",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: Clock,
              color: "text-yellow-600",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle,
              color: "text-blue-600",
            },
            {
              label: "Active Contracts",
              value: stats.activeContracts,
              icon: FileText,
              color: "text-primary",
            },
          ].map((s) => (
            <AnimatedItem key={s.label}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <s.icon className={`size-5 ${s.color}`} />
                    <div>
                      <div className={`text-2xl font-bold ${s.color}`}>
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

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs defaultValue="projects">
            <TabsList>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-4">
              {projects.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="mb-4">
                    You haven&apos;t posted any projects yet.
                  </p>
                  <Button variant="link" asChild>
                    <Link href="/post-project">Post your first project →</Link>
                  </Button>
                </div>
              ) : (
                <AnimatedList className="space-y-3">
                  {projects.map((p) => (
                    <AnimatedItem key={p.id}>
                      <Link href={`/projects/${p.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {p.title}
                                </h3>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {p.category} · ${p.budgetMin}–${p.budgetMax} ·{" "}
                                  {p.proposalCount} proposals
                                </div>
                              </div>
                              <Badge
                                variant={
                                  p.status === "OPEN" ? "default" : "secondary"
                                }
                                className={
                                  p.status === "OPEN"
                                    ? "bg-green-600 hover:bg-green-600"
                                    : p.status === "IN_PROGRESS"
                                      ? "bg-yellow-600 hover:bg-yellow-600 text-white"
                                      : ""
                                }
                              >
                                {p.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>

            <TabsContent value="contracts" className="mt-4">
              {contracts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  No contracts yet. Accept a proposal to create one.
                </div>
              ) : (
                <AnimatedList className="space-y-3">
                  {contracts.map((c) => (
                    <AnimatedItem key={c.id}>
                      <Link href={`/contracts/${c.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {c.projectTitle}
                                </h3>
                                <div className="text-sm text-muted-foreground mt-1">
                                  with {c.freelancerName} · ${c.agreedPrice}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  c.status === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  c.status === "ACTIVE"
                                    ? "bg-green-600 hover:bg-green-600"
                                    : ""
                                }
                              >
                                {c.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  );
}
