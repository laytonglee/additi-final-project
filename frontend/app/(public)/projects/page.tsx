"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { projectApi, ProjectData, PageData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  LayoutList,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Data Science",
  "Other",
];

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const EXPERIENCE_OPTIONS = [
  { value: "ENTRY", label: "Entry Level" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Expert" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "FIXED_PRICE", label: "Fixed Price" },
  { value: "HOURLY", label: "Hourly" },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-200",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-200",
};

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Filter state type ──────────────────────────────────────────────────────

interface Filters {
  keyword: string;
  category: string;
  status: string;
  experienceLevel: string;
  projectType: string;
  minBudget: string;
  maxBudget: string;
}

const DEFAULT_FILTERS: Filters = {
  keyword: "",
  category: "",
  status: "",
  experienceLevel: "",
  projectType: "",
  minBudget: "",
  maxBudget: "",
};

// ── Card skeleton ──────────────────────────────────────────────────────────

function ProjectCardSkeleton({ list = false }: { list?: boolean }) {
  if (list) {
    return (
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  );
}

// ── Grid card ──────────────────────────────────────────────────────────────

function GridCard({ project }: { project: ProjectData }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group flex flex-col">
        <CardHeader className="pb-2 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <Badge variant="secondary" className="text-xs font-medium">
              {project.category}
            </Badge>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                STATUS_COLORS[project.status] ??
                "bg-muted text-muted-foreground"
              }`}
            >
              {project.status}
            </span>
          </div>
          <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-sm leading-relaxed">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-foreground">
              {formatBudget(project.budgetMin)} –{" "}
              {formatBudget(project.budgetMax)}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Briefcase className="size-3" />
              {project.proposalCount} proposals
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.projectType && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {project.projectType === "FIXED_PRICE" ? "Fixed" : "Hourly"}
              </Badge>
            )}
            {project.experienceLevel && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {project.experienceLevel === "ENTRY"
                  ? "Entry"
                  : project.experienceLevel === "INTERMEDIATE"
                    ? "Mid"
                    : "Expert"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {timeAgo(project.createdAt)} · {project.clientName}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── List card ──────────────────────────────────────────────────────────────

function ListCard({ project }: { project: ProjectData }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    STATUS_COLORS[project.status] ??
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                <Badge variant="secondary" className="text-[10px]">
                  {project.category}
                </Badge>
                {project.projectType && (
                  <Badge variant="outline" className="text-[10px]">
                    {project.projectType === "FIXED_PRICE" ? "Fixed" : "Hourly"}
                  </Badge>
                )}
                {project.experienceLevel && (
                  <Badge variant="outline" className="text-[10px]">
                    {project.experienceLevel === "ENTRY"
                      ? "Entry"
                      : project.experienceLevel === "INTERMEDIATE"
                        ? "Mid"
                        : "Expert"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <div className="font-bold text-sm text-foreground">
                {formatBudget(project.budgetMin)} –{" "}
                {formatBudget(project.budgetMax)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Briefcase className="size-3" />
                {project.proposalCount} proposals
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {timeAgo(project.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Active filter chip ─────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-primary/70 transition-colors"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Applied filters (triggers re-fetch)
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  // Draft filters (controlled inputs, not yet applied)
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const keywordRef = useRef<HTMLInputElement>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const doFetch = useCallback(async (filters: Filters, pg: number) => {
    setLoading(true);
    try {
      const res = await projectApi.search({
        keyword: filters.keyword || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
        maxBudget: filters.maxBudget ? Number(filters.maxBudget) : undefined,
        page: pg,
        size: 12,
      });
      const data = res.data.data as PageData<ProjectData>;
      setProjects(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      setProjects([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch(applied, page);
  }, [applied, page, doFetch]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const applyFilters = () => {
    setApplied({ ...draft });
    setPage(0);
  };

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setPage(0);
  };

  const removeFilter = (key: keyof Filters) => {
    const next = { ...applied, [key]: "" };
    setApplied(next);
    setDraft(next);
    setPage(0);
  };

  // ── Active chips ──────────────────────────────────────────────────────────

  const activeChips: { key: keyof Filters; label: string }[] = [];
  if (applied.keyword)
    activeChips.push({ key: "keyword", label: `"${applied.keyword}"` });
  if (applied.category)
    activeChips.push({ key: "category", label: applied.category });
  if (applied.status)
    activeChips.push({ key: "status", label: applied.status });
  if (applied.experienceLevel) {
    const exp = EXPERIENCE_OPTIONS.find(
      (o) => o.value === applied.experienceLevel,
    );
    activeChips.push({
      key: "experienceLevel",
      label: exp?.label ?? applied.experienceLevel,
    });
  }
  if (applied.projectType) {
    const pt = PROJECT_TYPE_OPTIONS.find(
      (o) => o.value === applied.projectType,
    );
    activeChips.push({
      key: "projectType",
      label: pt?.label ?? applied.projectType,
    });
  }
  if (applied.minBudget)
    activeChips.push({ key: "minBudget", label: `Min $${applied.minBudget}` });
  if (applied.maxBudget)
    activeChips.push({ key: "maxBudget", label: `Max $${applied.maxBudget}` });

  // ── Pagination window ─────────────────────────────────────────────────────

  const windowSize = Math.min(totalPages, 7);
  const pagesArr = Array.from({ length: windowSize }, (_, i) => {
    if (totalPages <= 7) return i;
    if (page < 4) return i;
    if (page > totalPages - 5) return totalPages - 7 + i;
    return page - 3 + i;
  });

  return (
    <PageTransition>
      <TooltipProvider>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Browse Projects
              </h1>
              {!loading && (
                <p className="text-sm text-muted-foreground mt-1">
                  {totalElements.toLocaleString()} project
                  {totalElements !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters((v) => !v)}
                    className="gap-2"
                  >
                    <SlidersHorizontal className="size-4" />
                    Filters
                    {activeChips.length > 0 && (
                      <span className="ml-1 bg-background text-foreground border text-[10px] rounded-full px-1.5">
                        {activeChips.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle filter panel</TooltipContent>
              </Tooltip>
              <div className="flex rounded-md border overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-2.5 py-1.5 transition-colors ${
                        viewMode === "grid"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <LayoutGrid className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Grid view</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-2.5 py-1.5 transition-colors ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <LayoutList className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>List view</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={keywordRef}
              placeholder="Search projects by title or description…"
              className="pl-9 pr-24 h-11 text-sm"
              value={draft.keyword}
              onChange={(e) =>
                setDraft((d) => ({ ...d, keyword: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
            <Button
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8"
              onClick={applyFilters}
            >
              Search
            </Button>
          </motion.div>

          {/* Expandable filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="filters"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <Card className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Category</Label>
                      <Select
                        value={draft.category || "all"}
                        onValueChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            category: v === "all" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Status</Label>
                      <Select
                        value={draft.status || "all"}
                        onValueChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            status: v === "all" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          {STATUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Experience
                      </Label>
                      <Select
                        value={draft.experienceLevel || "all"}
                        onValueChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            experienceLevel: v === "all" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          {EXPERIENCE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Type</Label>
                      <Select
                        value={draft.projectType || "all"}
                        onValueChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            projectType: v === "all" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          {PROJECT_TYPE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Budget min */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Min Budget ($)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-8 text-xs"
                        value={draft.minBudget}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, minBudget: e.target.value }))
                        }
                      />
                    </div>

                    {/* Budget max */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Max Budget ($)
                      </Label>
                      <Input
                        type="number"
                        placeholder="∞"
                        className="h-8 text-xs"
                        value={draft.maxBudget}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, maxBudget: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset
                    </Button>
                    <Button size="sm" onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div
                key="chips"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-xs text-muted-foreground font-medium">
                  Active filters:
                </span>
                {activeChips.map((chip) => (
                  <FilterChip
                    key={chip.key}
                    label={chip.label}
                    onRemove={() => removeFilter(chip.key)}
                  />
                ))}
                <button
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project grid / list */}
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-5"
                  : "flex flex-col gap-3"
              }
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <ProjectCardSkeleton key={i} list={viewMode === "list"} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              className="text-center py-24 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="size-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No projects found</p>
              <p className="text-sm mt-1">
                Try adjusting your search or filters
              </p>
              {activeChips.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Clear all filters
                </Button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${JSON.stringify(applied)}-${page}-${viewMode}`}
                className={
                  viewMode === "grid"
                    ? "grid md:grid-cols-2 lg:grid-cols-3 gap-5"
                    : "flex flex-col gap-3"
                }
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.3 },
                      },
                    }}
                  >
                    {viewMode === "grid" ? (
                      <GridCard project={project} />
                    ) : (
                      <ListCard project={project} />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center gap-1.5 mt-8 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="h-8 w-8 p-0"
                title="First page"
              >
                <ChevronLeft className="size-3.5 -mr-1" />
                <ChevronLeft className="size-3.5 -ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 px-2 gap-1"
              >
                <ChevronLeft className="size-4" /> Prev
              </Button>

              {pagesArr.map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {p + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-8 px-2 gap-1"
              >
                Next <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="h-8 w-8 p-0"
                title="Last page"
              >
                <ChevronRight className="size-3.5 -mr-1" />
                <ChevronRight className="size-3.5 -ml-1" />
              </Button>
            </motion.div>
          )}
        </div>
      </TooltipProvider>
    </PageTransition>
  );
}
