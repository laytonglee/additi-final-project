"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, ProjectData, PageData } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`);

export default function AdminProjectsPage() {
  useRequireAuth("ADMIN");

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageData<ProjectData> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProjects({
        keyword: keyword || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page,
        size: 10,
      });
      setData(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setPage(0);
  }, [keyword, statusFilter]);

  const handleDelete = async (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await adminApi.deleteProject(projectId);
      fetchProjects();
    } catch {
      /* ignore */
    }
  };

  return (
    <PageTransition>
      <div>
        <motion.h1
          className="text-3xl font-bold text-foreground mb-8"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Manage Projects
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.content.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.content.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="pl-6 font-medium max-w-50 truncate">
                        {p.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.clientName}
                      </TableCell>
                      <TableCell>
                        {p.category ? (
                          <Badge variant="secondary" className="text-xs">
                            {p.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "OPEN"
                              ? "default"
                              : p.status === "IN_PROGRESS"
                                ? "secondary"
                                : p.status === "COMPLETED"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {p.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {fmt(p.budgetMin)} – {fmt(p.budgetMax)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="mr-1 size-3.5" /> Delete
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {data.number * data.size + 1}–
                {Math.min((data.number + 1) * data.size, data.totalElements)} of{" "}
                {data.totalElements}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
