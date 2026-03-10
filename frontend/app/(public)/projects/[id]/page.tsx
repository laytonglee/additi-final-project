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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2,
  Send,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

// ── Helpers ────────────────────────────────────────────────────────────────

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

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const PROPOSAL_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ACCEPTED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
};

// ── Skeleton ───────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

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
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
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

          {/* ── Hero section ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Status + badges row */}
            <div className="flex flex-wrap items-center gap-2">
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

            {/* Title + actions */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
                {project.title}
              </h1>
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

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link
                href={`/profile/${project.clientId}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors group"
              >
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {initials(project.clientName)}
                  </AvatarFallback>
                </Avatar>
                <span className="group-hover:text-primary font-medium transition-colors">
                  {project.clientName}
                </span>
              </Link>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {timeAgo(project.createdAt)}
              </span>
            </div>
          </motion.div>

          {/* ── Key metrics ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                    Budget
                  </p>
                  <p className="font-bold text-sm">
                    {fmt(project.budgetMin)} – {fmt(project.budgetMax)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Briefcase className="size-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                    Proposals
                  </p>
                  <p className="font-bold text-sm">{project.proposalCount}</p>
                </div>
              </CardContent>
            </Card>

            {project.deadline ? (
              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-3 flex items-center gap-3">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                      daysUntilDeadline !== null && daysUntilDeadline < 3
                        ? "bg-red-500/10"
                        : "bg-blue-500/10"
                    }`}
                  >
                    <CalendarDays
                      className={`size-4 ${
                        daysUntilDeadline !== null && daysUntilDeadline < 3
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                      Deadline
                    </p>
                    <p className="font-bold text-sm">
                      {new Date(project.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {daysUntilDeadline !== null && (
                      <p
                        className={`text-[10px] ${
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
                            : `${daysUntilDeadline}d left`}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-3 flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <CalendarDays className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                      Deadline
                    </p>
                    <p className="font-bold text-sm text-muted-foreground">
                      Flexible
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* ── Tabbed content ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                {isOwner && (
                  <TabsTrigger value="proposals">
                    Proposals
                    {proposals.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-[10px] px-1.5 py-0 h-4"
                      >
                        {proposals.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Description tab */}
              <TabsContent value="description" className="mt-4 space-y-5">
                <Card>
                  <CardContent className="pt-5">
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {project.description}
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned freelancer */}
                {project.assignedFreelancerName && (
                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Assigned Freelancer
                      </p>
                      <Link
                        href={`/profile/${project.assignedFreelancerId}`}
                        className="flex items-center gap-3 group"
                      >
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {initials(project.assignedFreelancerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                            {project.assignedFreelancerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            View profile →
                          </p>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Client info */}
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      About the Client
                    </p>
                    <Link
                      href={`/profile/${project.clientId}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials(project.clientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {project.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Posted {timeAgo(project.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Proposals tab (owner only) */}
              {isOwner && (
                <TabsContent value="proposals" className="mt-4">
                  <Card>
                    <CardContent className="pt-5">
                      {proposals.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Briefcase className="size-8 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">
                            No proposals yet
                          </p>
                          <p className="text-xs mt-1">
                            Proposals will appear here when freelancers apply
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {proposals.map((p, i) => (
                            <div key={p.id}>
                              {i > 0 && <Separator className="my-4" />}
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
                                          PROPOSAL_STATUS_STYLE[p.status] ??
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
                </TabsContent>
              )}
            </Tabs>
          </motion.div>

          {/* ── Bottom CTA ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            {/* Freelancer — proposal form */}
            {isFreelancer() && project.status === "OPEN" && !isOwner && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="size-4 text-primary" />
                    Submit a Proposal
                  </CardTitle>
                  <CardDescription>
                    Tell the client why you&apos;re the best fit for this
                    project.
                  </CardDescription>
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
                            Client budget: {fmt(project.budgetMin)} –{" "}
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
                            {submitting ? "Submitting…" : "Submit Proposal"}
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
            )}

            {/* Guest CTA */}
            {!user && project.status === "OPEN" && (
              <Card className="text-center">
                <CardContent className="pt-6 pb-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Interested in this project?
                  </p>
                  <Button asChild>
                    <Link href="/login">Sign in to Apply</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </TooltipProvider>
    </PageTransition>
  );
}
