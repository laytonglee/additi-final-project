"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import {
  categoryApi,
  projectApi,
  proposalApi,
  CategoryData,
  ProjectData,
  ProposalData,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Pencil,
  Eye,
  FileText,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";
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
    .map((w) => w[0])
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

export default function ClientProjectDetailPage() {
  useRequireAuth("CLIENT");

  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const projectId = Number(id);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, pRes, cRes] = await Promise.all([
          projectApi.getById(projectId),
          proposalApi.getByProject(projectId),
          categoryApi.getAll(),
        ]);
        setProject(res.data.data);
        setProposals(pRes.data.data);
        setCategories(cRes.data.data);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const refresh = async () => {
    const [res, pRes] = await Promise.all([
      projectApi.getById(projectId),
      proposalApi.getByProject(projectId),
    ]);
    setProject(res.data.data);
    setProposals(pRes.data.data);
  };

  useEffect(() => {
    if (!project) return;
    setForm({
      title: project.title,
      description: project.description ?? "",
      category: project.category ?? "",
      budgetMin: String(project.budgetMin ?? ""),
      budgetMax: String(project.budgetMax ?? ""),
      deadline: project.deadline ?? "",
    });
  }, [project]);

  const handleAccept = async (id: number) => {
    await proposalApi.accept(id);
    await refresh();
  };

  const handleReject = async (id: number) => {
    await proposalApi.reject(id);
    await refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project?")) return;
    setDeleting(true);
    try {
      await projectApi.delete(projectId);
      router.push("/client/projects");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!form.category) {
      setFormError("Category is required.");
      return;
    }

    if (Number(form.budgetMin) > Number(form.budgetMax)) {
      setFormError("Minimum budget cannot exceed maximum budget.");
      return;
    }

    setSaving(true);
    try {
      await projectApi.update(projectId, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        deadline: form.deadline || null,
      });
      setEditing(false);
      await refresh();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;
      setFormError(message ?? "Unable to update this project.");
    } finally {
      setSaving(false);
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

  const isOwner = user && user.id === project.clientId;
  const canEdit = Boolean(isOwner && project.status === "OPEN");

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}

        <Button variant="ghost" asChild className="gap-2">
          <Link href="/client/projects">
            <ArrowLeft className="size-4" />
            My Projects
          </Link>
        </Button>

        {/* HERO */}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="border rounded-xl p-6 bg-card space-y-5">
            <div className="flex items-start justify-between gap-6">
              {/* LEFT SIDE */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{project.title}</h1>

                <div className="flex gap-6 text-sm text-muted-foreground">
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

              {/* RIGHT SIDE */}

              <div className="flex flex-col items-end gap-3 shrink-0">
                {isOwner && canEdit ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setEditing((prev) => !prev);
                        setFormError("");
                      }}
                    >
                      <Pencil className="size-4" />
                      {editing ? "Cancel" : "Edit"}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 className="size-4" />
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Badge variant="secondary">{project.category}</Badge>

                    <Badge
                      className={`text-xs border ${STATUS_COLORS[project.status]}`}
                    >
                      {project.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* {isOwner && (
              <div className="flex flex-wrap gap-2 pt-4 border-t bg-">
                {canEdit ? (
                  <>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setEditing((prev) => !prev);
                        setFormError("");
                      }}
                    >
                      <Pencil className="size-4" />
                      {editing ? "Cancel Editing" : "Edit Project"}
                    </Button>

                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 className="size-4" />
                      {deleting ? "Deleting..." : "Delete Project"}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only projects with status OPEN can be edited or deleted.
                  </p>
                )}
              </div>
            )} */}

            {/* STATS */}

            <div className="flex flex-wrap justify-between pt-4 border-t gap-y-4">
              <div className="min-w-30">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold">
                  {fmt(project.budgetMin)} – {fmt(project.budgetMax)}
                </p>
              </div>

              <div className="min-w-30">
                <p className="text-xs text-muted-foreground">Proposals</p>
                <p className="font-semibold">{proposals.length}</p>
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

        {editing && canEdit && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h2 className="text-lg font-semibold">Edit Project</h2>
                <p className="text-sm text-muted-foreground">
                  Changes are only allowed while the project is still open.
                </p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                {formError ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    className="resize-none"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum Budget ($)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      min={1}
                      value={form.budgetMin}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          budgetMin: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum Budget ($)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      min={1}
                      value={form.budgetMax}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          budgetMax: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* DESCRIPTION */}

        <Card>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="size-4 " />
                Project Description
              </h2>

              <div className="border rounded-lg p-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30">
                {project.description}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="size-4" />
                  Proposals
                </h2>

                <Badge variant="secondary">{proposals.length}</Badge>
              </div>

              {proposals.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  No proposals yet
                </div>
              )}

              <div className="divide-y border rounded-lg">
                {proposals.map((p) => (
                  <div key={p.id} className="p-5 space-y-3">
                    {/* Header */}

                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <Avatar>
                          <AvatarImage
                            src={p.freelancerAvatarUrl ?? undefined}
                          />
                          <AvatarFallback>
                            {initials(p.freelancerName)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <Link
                            href={`/profile/${p.freelancerId}`}
                            className="font-semibold hover:text-primary"
                          >
                            {p.freelancerName}
                          </Link>

                          <p className="text-xs text-muted-foreground">
                            {timeAgo(p.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {fmt(p.offeredPrice)}
                        </p>

                        <Badge
                          className={`text-xs ${PROPOSAL_STATUS_COLORS[p.status]}`}
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Pitch */}

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.pitchText}
                    </p>

                    {/* Actions */}

                    {p.status === "PENDING" && project.status === "OPEN" && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => handleAccept(p.id)}>
                          <CheckCircle className="size-4 mr-1" />
                          Accept
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(p.id)}
                        >
                          <X className="size-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
