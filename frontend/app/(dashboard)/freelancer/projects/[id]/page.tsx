"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { projectApi, proposalApi, ProjectData, ProposalData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

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
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-60 w-full rounded-xl" />
    </div>
  );
}

export default function FreelancerProjectDetailPage() {
  useRequireAuth("FREELANCER");

  const { id } = useParams();
  const { user } = useAuthStore();

  const projectId = Number(id);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [myProposal, setMyProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [pitch, setPitch] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isOwner = user && project && user.id === project.clientId;

  const fetchData = async () => {
    try {
      const projectRes = await projectApi.getById(projectId);
      setProject(projectRes.data.data);

      try {
        const proposalRes = await proposalApi.getMy();
        const existingProposal =
          proposalRes.data.data.find(
            (proposal) => proposal.projectId === projectId,
          ) ?? null;

        setMyProposal(existingProposal);
      } catch {
        setMyProposal(null);
      }
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [projectId]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      await proposalApi.submit(projectId, {
        pitchText: pitch,
        offeredPrice: Number(price),
      });
      setShowProposalForm(false);
      setPitch("");
      setPrice("");
      await fetchData();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;
      setSubmitError(message ?? "Unable to submit your proposal right now.");
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!project) {
    return (
      <div className="text-center py-24">
        <XCircle className="size-12 mx-auto mb-4 opacity-40" />
        <h1 className="text-2xl font-bold">Project Not Found</h1>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/projects">
            <ArrowLeft className="size-4" />
            Browse Projects
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="border rounded-xl p-6 bg-card space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{project.title}</h1>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    Posted {timeAgo(project.createdAt)}
                  </span>

                  <span className="flex items-center gap-1">
                    <Eye className="size-4" />
                    {project.viewCount} views
                  </span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                <Badge variant="secondary">{project.category}</Badge>

                <Badge
                  className={`text-xs border ${STATUS_COLORS[project.status]}`}
                >
                  {project.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap justify-between pt-4 border-t gap-y-4 gap-x-6">
              <div className="min-w-30">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold">
                  {fmt(project.budgetMin)} – {fmt(project.budgetMax)}
                </p>
              </div>

              <div className="min-w-30">
                <p className="text-xs text-muted-foreground">Proposals</p>
                <p className="font-semibold">{project.proposalCount}</p>
              </div>

              <div className="min-w-30">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-semibold">
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString()
                    : "None"}
                </p>
              </div>

              <div className="min-w-30">
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="font-semibold">{project.viewCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="size-4" />
                Project Description
              </h2>

              <div className="border rounded-lg p-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30">
                {project.description}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="size-4" />
                Client
              </h2>

              <Link
                href={`/profile/${project.clientId}`}
                className="flex items-center gap-3 rounded-lg border p-4 hover:border-primary/40 transition-colors"
              >
                <Avatar>
                  <AvatarFallback>
                    {initials(project.clientName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {project.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Posted {timeAgo(project.createdAt)}
                  </p>
                </div>
              </Link>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Send className="size-4" />
                  Apply for This Project
                </h2>

                {myProposal && (
                  <Badge
                    className={`text-xs ${PROPOSAL_STATUS_COLORS[myProposal.status]}`}
                  >
                    {myProposal.status}
                  </Badge>
                )}
              </div>

              {myProposal ? (
                <div className="border rounded-lg p-5 space-y-4 bg-muted/20">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-muted-foreground">Your bid</p>
                      <p className="text-xl font-bold">
                        {fmt(myProposal.offeredPrice)}
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Submitted {timeAgo(myProposal.createdAt)}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Proposal message
                    </p>
                    <div className="border rounded-lg p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-background">
                      {myProposal.pitchText}
                    </div>
                  </div>

                  {myProposal.status === "ACCEPTED" && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      <CheckCircle className="size-4" />
                      Your proposal was accepted.
                    </div>
                  )}
                </div>
              ) : project.status !== "OPEN" || isOwner ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  {isOwner
                    ? "You own this project, so you cannot apply to it."
                    : "This project is no longer accepting proposals."}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Submit your proposal
                    </CardTitle>
                    <CardDescription>
                      Use the same project detail layout as the client page,
                      with freelancer application controls here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence mode="wait">
                      {!showProposalForm ? (
                        <motion.div
                          key="proposal-cta"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Button
                            className="w-full gap-2"
                            onClick={() => setShowProposalForm(true)}
                          >
                            <Send className="size-4" />
                            Apply Now
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="proposal-form"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleSubmitProposal}
                          className="space-y-4"
                        >
                          {submitError ? (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                              {submitError}
                            </div>
                          ) : null}

                          <div className="space-y-2">
                            <Label htmlFor="pitch">Cover Letter</Label>
                            <Textarea
                              id="pitch"
                              required
                              value={pitch}
                              onChange={(e) => setPitch(e.target.value)}
                              rows={5}
                              placeholder="Describe your approach, relevant experience, and why you're a fit for this project."
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

                          <div className="flex gap-2 pt-2">
                            <Button
                              type="submit"
                              disabled={submitting}
                              className="gap-2"
                            >
                              {submitting ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Send className="size-4" />
                              )}
                              {submitting ? "Submitting..." : "Submit Proposal"}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
