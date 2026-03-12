"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { projectApi, proposalApi, ProjectData, ProposalData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ArrowLeft, Clock, XCircle } from "lucide-react";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

// ───────────────── Helpers ─────────────────

const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`);

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return `${Math.floor(days / 30)}mo ago`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

// ───────────────── Skeleton ─────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

// ───────────────── Metric Card ─────────────────

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="">
        <p className="text-xs text-muted-foreground uppercase mb-1">{label}</p>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// ───────────────── Page ─────────────────

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { user, isFreelancer } = useAuthStore();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);

  const viewTracked = useRef(false);
  const projectId = Number(id);
  const isOwner = user && project && user.id === project.clientId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await projectApi.getById(projectId);
        setProject(res.data.data);

        if (!viewTracked.current) {
          viewTracked.current = true;
          projectApi.trackView(projectId).catch(() => {});
        }

        try {
          const pRes = await proposalApi.getByProject(projectId);
          setProposals(pRes.data.data);
        } catch {}
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchData();
  }, [projectId]);

  if (loading) return <DetailSkeleton />;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <XCircle className="size-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This project may have been removed or doesn't exist.
        </p>

        <Button variant="outline" asChild>
          <Link href="/projects">
            <ArrowLeft className="size-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          {/* ================= MAIN CONTENT ================= */}

          <div className="space-y-6">
            {/* Back Button */}

            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Link href="/projects">
                  <ArrowLeft className="size-4" />
                  All Projects
                </Link>
              </Button>
            </motion.div>

            {/* HERO */}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    STATUS_STYLE[project.status] ??
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {project.status.replace("_", " ")}
                </span>

                <Badge variant="secondary">{project.category}</Badge>

                {project.projectType && (
                  <Badge variant="outline">
                    {project.projectType === "FIXED_PRICE"
                      ? "Fixed Price"
                      : "Hourly"}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {project.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link
                  href={`/profile/${project.clientId}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials(project.clientName)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="font-medium">{project.clientName}</span>
                </Link>

                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {timeAgo(project.createdAt)}
                </span>
              </div>
            </motion.div>

            {/* DESCRIPTION */}

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </div>
              </CardContent>
            </Card>

            {/* PROPOSALS */}

            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Proposals ({proposals.length})</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {proposals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No proposals yet.
                    </p>
                  ) : (
                    proposals.map((p) => (
                      <Card
                        key={p.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-3">
                            <Avatar className="size-10">
                              <AvatarImage
                                src={p.freelancerAvatarUrl ?? undefined}
                              />
                              <AvatarFallback>
                                {initials(p.freelancerName)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <Link
                                  href={`/profile/${p.freelancerId}`}
                                  className="font-semibold hover:text-primary"
                                >
                                  {p.freelancerName}
                                </Link>

                                <span className="font-bold text-primary">
                                  {fmt(p.offeredPrice)}
                                </span>
                              </div>

                              <p className="text-sm text-muted-foreground mt-2">
                                {p.pitchText}
                              </p>

                              <p className="text-xs text-muted-foreground mt-2">
                                {timeAgo(p.createdAt)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ================= SIDEBAR ================= */}

          <div className="space-y-6 ">
            <div className="sticky top-24 space-y-4 ">
              <MetricCard
                label="Budget"
                value={`${fmt(project.budgetMin)} – ${fmt(project.budgetMax)}`}
              />

              <MetricCard label="Proposals" value={project.proposalCount} />

              <MetricCard label="Views" value={project.viewCount} />

              {project.deadline && (
                <MetricCard
                  label="Deadline"
                  value={new Date(project.deadline).toLocaleDateString()}
                />
              )}

              {project.status === "OPEN" &&
                !isOwner &&
                (!user || isFreelancer()) && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Submit Proposal
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {!user ? (
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={() => router.push("/login")}
                        >
                          Apply for this Job
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={() =>
                            router.push(`/freelancer/projects/${projectId}`)
                          }
                        >
                          Apply for this Job
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
