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
import { CheckCircle, Loader2, Trash2, X } from "lucide-react";

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
    const fetch = async () => {
      try {
        const res = await projectApi.getById(projectId);
        setProject(res.data.data);
        try {
          const pRes = await proposalApi.getByProject(projectId);
          setProposals(pRes.data.data);
        } catch {
          /* not authorized or no proposals */
        }
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetch();
  }, [projectId]);

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
      try {
        const pRes = await proposalApi.getByProject(projectId);
        setProposals(pRes.data.data);
      } catch {
        /* ignore */
      }
      const res = await projectApi.getById(projectId);
      setProject(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (proposalId: number) => {
    try {
      await proposalApi.accept(proposalId);
      const res = await projectApi.getById(projectId);
      setProject(res.data.data);
      const pRes = await proposalApi.getByProject(projectId);
      setProposals(pRes.data.data);
    } catch {
      /* ignore */
    }
  };

  const handleReject = async (proposalId: number) => {
    try {
      await proposalApi.reject(proposalId);
      const pRes = await proposalApi.getByProject(projectId);
      setProposals(pRes.data.data);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Project Not Found
        </h1>
        <Button variant="link" asChild>
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{project.category}</Badge>
                <Badge
                  variant={project.status === "OPEN" ? "default" : "outline"}
                  className={
                    project.status === "OPEN"
                      ? "bg-green-600 hover:bg-green-600"
                      : project.status === "IN_PROGRESS"
                        ? "bg-yellow-600 hover:bg-yellow-600 text-white"
                        : ""
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
            </div>
            {isOwner && project.status === "OPEN" && (
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
            <span>
              Budget:{" "}
              <strong className="text-foreground">
                ${project.budgetMin} – ${project.budgetMax}
              </strong>
            </span>
            <span>
              Proposals:{" "}
              <strong className="text-foreground">
                {project.proposalCount}
              </strong>
            </span>
            {project.deadline && (
              <span>
                Deadline:{" "}
                <strong className="text-foreground">
                  {new Date(project.deadline).toLocaleDateString()}
                </strong>
              </span>
            )}
            <span>
              Posted by{" "}
              <Link
                href={`/profile/${project.clientId}`}
                className="text-primary hover:underline font-medium"
              >
                {project.clientName}
              </Link>
            </span>
          </div>

          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {project.description}
          </div>
        </CardContent>
      </Card>

      {/* Submit Proposal (Freelancers only) */}
      {isFreelancer() && project.status === "OPEN" && !isOwner && (
        <Card>
          <CardContent className="pt-6">
            {!showProposalForm ? (
              <Button
                className="w-full"
                onClick={() => setShowProposalForm(true)}
              >
                Submit a Proposal
              </Button>
            ) : (
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <CardTitle className="text-lg">Your Proposal</CardTitle>
                <div className="space-y-2">
                  <Label htmlFor="pitch">Your Pitch</Label>
                  <Textarea
                    id="pitch"
                    required
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    rows={4}
                    placeholder="Why are you the best fit for this project?"
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Your Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
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
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Proposals list (visible to project owner) */}
      {isOwner && proposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proposals ({proposals.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposals.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${p.freelancerId}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {p.freelancerName}
                      </Link>
                      <Badge
                        variant={
                          p.status === "PENDING"
                            ? "secondary"
                            : p.status === "ACCEPTED"
                              ? "default"
                              : "destructive"
                        }
                        className={
                          p.status === "ACCEPTED"
                            ? "bg-green-600 hover:bg-green-600"
                            : ""
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    ${p.offeredPrice}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                  {p.pitchText}
                </p>
                {p.status === "PENDING" && project.status === "OPEN" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => handleAccept(p.id)}>
                      <CheckCircle className="mr-1 size-3.5" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(p.id)}
                    >
                      <X className="mr-1 size-3.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
