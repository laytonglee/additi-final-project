"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { projectApi, proposalApi, ProjectData, ProposalData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Loader2,
  Send,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-200",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-200",
};

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  ACCEPTED: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  REJECTED: "bg-red-500/10 text-red-500 border-red-200",
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;

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

// â”€â”€ Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isClient, isFreelancer } = useAuthStore();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [pitch, setPitch] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const projectId = Number(id);
  const isOwner = user && project && user.id === project.clientId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await projectApi.getById(projectId);
        setProject(res.data.data);
        try {
          const pRes = await proposalApi.getByProject(projectId);
          setProposals(pRes.data.data);
        } catch {
          /* not authorized */
        }
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchData();
  }, [projectId]);

  const refresh = async () => {
    const res = await projectApi.getById(projectId);
    setProject(res.data.data);
    try {
      const pRes = await proposalApi.getByProject(projectId);
      setProposals(pRes.data.data);
    } catch {
      /* ignore */
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await proposalApi.submit(projectId, {
        pitchText: pitch,
        offeredPrice: Number(price),
      });
      setShowProposalForm(false);
      setPitch("");
      setPrice("");
      await refresh();
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (proposalId: number) => {
    try {
      await proposalApi.accept(proposalId);
      await refresh();
    } catch {
      /* ignore */
    }
  };

  const handleReject = async (proposalId: number) => {
    try {
      await proposalApi.reject(proposalId);
      await refresh();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectApi.delete(projectId);
      router.push("/client/dashboard");
    } catch {
      /* ignore */
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <XCircle className="size-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This project may have been removed or doesn&apos;t exist.
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

  const daysUntilDeadline = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <PageTransition>
      <TooltipProvider>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/projects">
                <ArrowLeft className="size-4" />
                Browse Projects
              </Link>
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            {/* â”€â”€ Left column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="space-y-5 min-w-0">
              {/* Title card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="secondary">{project.category}</Badge>
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              STATUS_COLORS[project.status] ??
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {project.status.replace("_", " ")}
                          </span>
                          {project.projectType && (
                            <Badge variant="outline" className="text-xs">
                              {project.projectType === "FIXED_PRICE"
                                ? "Fixed Price"
                                : "Hourly"}
                            </Badge>
                          )}
                          {project.experienceLevel && (
                            <Badge variant="outline" className="text-xs">
                              {project.experienceLevel === "ENTRY"
                                ? "Entry Level"
                                : project.experienceLevel === "INTERMEDIATE"
                                  ? "Intermediate"
                                  : "Expert"}
                            </Badge>
                          )}
                        </div>
                        <h1 className="text-2xl font-bold leading-tight">
                          {project.title}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="size-3.5" />
                            Posted by{" "}
                            <Link
                              href={`/profile/${project.clientId}`}
                              className="text-primary hover:underline ml-0.5 font-medium"
                            >
                              {project.clientName}
                            </Link>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {timeAgo(project.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="size-3.5" />
                            {project.viewCount} views
                          </span>
                        </p>
                      </div>
                      {isOwner && project.status === "OPEN" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={handleDelete}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete project</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </CardHeader>

                  <Separator />

                  <CardContent className="pt-5">
                    <h2 className="text-sm font-semibold text-foreground mb-3">
                      Project Description
                    </h2>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {project.description}
                    </div>

                    {project.assignedFreelancerName && (
                      <div className="mt-5 pt-5 border-t flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {initials(project.assignedFreelancerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Assigned to{" "}
                          </span>
                          <Link
                            href={`/profile/${project.assignedFreelancerId}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {project.assignedFreelancerName}
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Proposal form (freelancers) */}
              {isFreelancer() && project.status === "OPEN" && !isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Send className="size-4 text-primary" />
                        Submit a Proposal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimatePresence mode="wait">
                        {!showProposalForm ? (
                          <motion.div
                            key="cta"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <p className="text-sm text-muted-foreground mb-4">
                              Interested in this project? Submit your proposal
                              and let the client know why you&apos;re the best
                              fit.
                            </p>
                            <Button
                              className="w-full gap-2"
                              onClick={() => setShowProposalForm(true)}
                            >
                              <Send className="size-4" />
                              Write a Proposal
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.form
                            key="form"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmitProposal}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="pitch">Cover Letter</Label>
                              <Textarea
                                id="pitch"
                                required
                                value={pitch}
                                onChange={(e) => setPitch(e.target.value)}
                                rows={5}
                                placeholder="Why are you the best fit for this project? What's your approach?"
                                className="resize-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price">Your Bid ($)</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                  id="price"
                                  type="number"
                                  required
                                  min={1}
                                  value={price}
                                  onChange={(e) => setPrice(e.target.value)}
                                  placeholder="500"
                                  className="pl-8"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Client budget: {fmt(project.budgetMin)} â€“{" "}
                                {fmt(project.budgetMax)}
                              </p>
                            </div>
                            <div className="flex gap-3 pt-1">
                              <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 gap-2"
                              >
                                {submitting ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Send className="size-4" />
                                )}
                                {submitting
                                  ? "Submittingâ€¦"
                                  : "Submit Proposal"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowProposalForm(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Proposals list (project owner) */}
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Briefcase className="size-4 text-primary" />
                          Proposals
                        </CardTitle>
                        <Badge variant="secondary">{proposals.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {proposals.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <Briefcase className="size-8 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No proposals yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {proposals.map((p, i) => (
                            <div key={p.id}>
                              {i > 0 && <Separator className="mb-4" />}
                              <div className="flex gap-3">
                                <Avatar className="size-9 shrink-0">
                                  <AvatarImage
                                    src={p.freelancerAvatarUrl ?? undefined}
                                  />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {initials(p.freelancerName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <Link
                                        href={`/profile/${p.freelancerId}`}
                                        className="font-semibold text-sm hover:text-primary transition-colors"
                                      >
                                        {p.freelancerName}
                                      </Link>
                                      <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                          PROPOSAL_STATUS_COLORS[p.status] ??
                                          "bg-muted"
                                        }`}
                                      >
                                        {p.status}
                                      </span>
                                    </div>
                                    <span className="font-bold text-sm text-foreground">
                                      {fmt(p.offeredPrice)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                                    {p.pitchText}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {timeAgo(p.createdAt)}
                                  </p>
                                  {p.status === "PENDING" &&
                                    project.status === "OPEN" && (
                                      <div className="flex gap-2 mt-3">
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs gap-1"
                                          onClick={() => handleAccept(p.id)}
                                        >
                                          <CheckCircle className="size-3.5" />
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-xs gap-1"
                                          onClick={() => handleReject(p.id)}
                                        >
                                          <X className="size-3.5" />
                                          Decline
                                        </Button>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* â”€â”€ Right sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <motion.div
              className="space-y-4 lg:sticky lg:top-20"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {/* Budget & stats card */}
              <Card>
                <CardContent className="pt-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <DollarSign className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-bold text-base">
                          {fmt(project.budgetMin)} â€“ {fmt(project.budgetMax)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Briefcase className="size-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Proposals
                        </p>
                        <p className="font-bold text-base">
                          {project.proposalCount}
                        </p>
                      </div>
                    </div>

                    {project.deadline && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                              daysUntilDeadline !== null &&
                              daysUntilDeadline < 3
                                ? "bg-red-500/10"
                                : "bg-blue-500/10"
                            }`}
                          >
                            <CalendarDays
                              className={`size-4 ${
                                daysUntilDeadline !== null &&
                                daysUntilDeadline < 3
                                  ? "text-red-500"
                                  : "text-blue-500"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Deadline
                            </p>
                            <p className="font-bold text-base">
                              {new Date(project.deadline).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            {daysUntilDeadline !== null && (
                              <p
                                className={`text-xs mt-0.5 ${
                                  daysUntilDeadline < 0
                                    ? "text-red-500"
                                    : daysUntilDeadline < 3
                                      ? "text-orange-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {daysUntilDeadline < 0
                                  ? `${Math.abs(daysUntilDeadline)}d overdue`
                                  : daysUntilDeadline === 0
                                    ? "Due today"
                                    : `${daysUntilDeadline}d remaining`}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Eye className="size-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-bold text-base">
                          {project.viewCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client card */}
              <Card>
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    About the Client
                  </p>
                  <Link
                    href={`/profile/${project.clientId}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials(project.clientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {project.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        View profile â†’
                      </p>
                    </div>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock className="size-3" />
                    Posted {timeAgo(project.createdAt)}
                  </p>
                </CardContent>
              </Card>

              {/* Freelancer sidebar CTA */}
              {isFreelancer() && project.status === "OPEN" && !isOwner && (
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    setShowProposalForm(true);
                    document
                      .getElementById("proposal-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Send className="size-4" />
                  Apply for this Project
                </Button>
              )}

              {/* Guest CTA */}
              {!user && project.status === "OPEN" && (
                <Button className="w-full gap-2" variant="outline" asChild>
                  <Link href="/login">Sign in to Apply</Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </TooltipProvider>
    </PageTransition>
  );
}
