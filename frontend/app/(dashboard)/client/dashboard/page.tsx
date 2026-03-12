"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectApi, contractApi, ProjectData, ContractData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  FolderOpen,
  Clock,
  CheckCircle,
  FileText,
  Briefcase,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

const listItemVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const formatBudget = (val: number) =>
  val >= 1000
    ? `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`
    : `$${val}`;
/* ── Stat card ────────────────────────────────── */
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

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-200",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-200",
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  OPEN: FolderOpen,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
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
          projectApi.getMy(0, 50),
          contractApi.getMy(),
        ]);
        setProjects(projRes.data.data.content);
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

  const STATUS_ICONS: Record<string, React.ElementType> = {
    OPEN: FolderOpen,
    IN_PROGRESS: Clock,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle,
  };

  function ProjectRowCard({ project }: { project: ProjectData }) {
    const StatusIcon = STATUS_ICONS[project.status] || FolderOpen;
    return (
      <Link href={`/client/projects/${project.id}`}>
        <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              {/* Left: info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate text-base">
                  {project.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1.5">
                  <span className="font-semibold text-foreground">
                    {formatBudget(project.budgetMin)} –{" "}
                    {formatBudget(project.budgetMax)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3" />
                    {project.proposalCount} proposals
                  </span>
                  <span className="hidden sm:inline">
                    Posted {timeAgo(project.createdAt)}
                  </span>
                  <Badge variant="secondary">{project.category}</Badge>
                </div>
              </div>

              {/* Right: status + arrow */}
              <div className="flex items-center gap-3 shrink-0">
                <Badge className={STATUS_COLORS[project.status]}>
                  <StatusIcon className="size-3 mr-1" />
                  {project.status.replace("_", " ")}
                </Badge>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  /* ── Empty state ──────────────────────────────── */
  function EmptyState({ message }: { message: string }) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Briefcase className="mx-auto size-12 mb-4 opacity-30" />
        <p>{message}</p>
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
              <StatCard
                title={s.label}
                value={s.value}
                icon={<s.icon className={`size-5 ${s.color}`} />}
              />
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
                <EmptyState message="No projects yet. Post your first project!" />
              ) : (
                <AnimatedList className="space-y-3">
                  {projects.map((p) => (
                    <AnimatedItem key={p.id}>
                      <ProjectRowCard project={p} />
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
                          <CardContent className="">
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
