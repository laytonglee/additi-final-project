"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, AdminUserData, PageData } from "@/lib/api";
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
import {
  Ban,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

export default function AdminUsersPage() {
  useRequireAuth("ADMIN");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageData<AdminUserData> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.searchUsers({
        search: search || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        banned:
          statusFilter === "BANNED"
            ? true
            : statusFilter === "ACTIVE"
              ? false
              : undefined,
        page,
        size: 10,
      });
      setData(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(0);
  }, [search, roleFilter, statusFilter]);

  const handleToggleBan = async (userId: number) => {
    try {
      await adminApi.toggleBan(userId);
      fetchUsers();
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
          Manage Users
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
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-37.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
                <SelectItem value="FREELANCER">Freelancer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-37.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="BANNED">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.content.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.content.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="pl-6 font-medium">
                        {u.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {u.roles.map((r) => (
                            <Badge
                              key={r}
                              variant="secondary"
                              className="text-xs"
                            >
                              {r.replace("ROLE_", "")}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-600"
                          >
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={u.isBanned ? "outline" : "destructive"}
                          onClick={() => handleToggleBan(u.id)}
                        >
                          {u.isBanned ? (
                            <>
                              <ShieldCheck className="mr-1 size-3.5" /> Unban
                            </>
                          ) : (
                            <>
                              <Ban className="mr-1 size-3.5" /> Ban
                            </>
                          )}
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
