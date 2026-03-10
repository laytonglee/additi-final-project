"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectApi, ProjectData } from "@/lib/api";
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
  XCircle,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

// ── Constants ──────────────────────────────────────────────────────────────

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

const formatBudget = (val: number) =>
  val >= 1000
    ? `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`
    : `$${val}`;

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ClientProjectsPage() {
  useRequireAuth("CLIENT");
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectApi.getMy();
        setProjects(res.data.data.content);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProjects();
  }, [user]);

  const open = projects.filter((p) => p.status === "OPEN");
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS");
  const completed = projects.filter((p) => p.status === "COMPLETED");

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

  /* ── Project row card ─────────────────────────── */
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

  /* ── Loading skeleton ─────────────────────────── */
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
      <div className="w-full">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <Button asChild>
            <Link href="/post-project">
              <Plus className="mr-2 size-4" />
              New Project
            </Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <AnimatedList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Projects"
            value={projects.length}
            icon={<Briefcase className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Open"
            value={open.length}
            icon={<FolderOpen className="h-5 w-5 text-emerald-600" />}
          />
          <StatCard
            title="In Progress"
            value={inProgress.length}
            icon={<Clock className="h-5 w-5 text-blue-600" />}
          />
          <StatCard
            title="Completed"
            value={completed.length}
            icon={<CheckCircle className="h-5 w-5 text-gray-500" />}
          />
        </AnimatedList>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
              <TabsTrigger value="progress">
                In Progress ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completed.length})
              </TabsTrigger>
            </TabsList>

            {/* All projects */}
            <TabsContent value="all">
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

            {/* Open projects */}
            <TabsContent value="open" className="mt-4">
              {open.length === 0 ? (
                <EmptyState message="No open projects right now." />
              ) : (
                <AnimatedList className="space-y-3">
                  {open.map((p) => (
                    <AnimatedItem key={p.id}>
                      <ProjectRowCard project={p} />
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>

            {/* In Progress projects */}
            <TabsContent value="progress" className="mt-4">
              {inProgress.length === 0 ? (
                <EmptyState message="No projects in progress right now." />
              ) : (
                <AnimatedList className="space-y-3">
                  {inProgress.map((p) => (
                    <AnimatedItem key={p.id}>
                      <ProjectRowCard project={p} />
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>

            {/* Completed projects */}
            <TabsContent value="completed" className="mt-4">
              {completed.length === 0 ? (
                <EmptyState message="No completed projects yet." />
              ) : (
                <AnimatedList className="space-y-3">
                  {completed.map((p) => (
                    <AnimatedItem key={p.id}>
                      <ProjectRowCard project={p} />
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
