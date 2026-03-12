"use client";

import { useEffect, useState, useCallback } from "react";
import { categoryApi, CategoryData } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Pencil, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

export default function AdminCategoriesPage() {
  useRequireAuth("ADMIN");

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await categoryApi.create(newName.trim());
      setNewName("");
      fetchCategories();
    } catch {
      /* ignore */
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await categoryApi.update(id, editingName.trim());
      setEditingId(null);
      setEditingName("");
      fetchCategories();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryApi.delete(id);
      fetchCategories();
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
          Manage Categories
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Create new category */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="New category name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              <Plus className="mr-1 size-4" /> Add Category
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead className="w-50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 2 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No categories yet — add one above
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="pl-6">
                        {editingId === c.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(c.id);
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditingName("");
                              }
                            }}
                            className="max-w-xs"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium">{c.name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingId === c.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdate(c.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingName("");
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingId(c.id);
                                  setEditingName(c.name);
                                }}
                              >
                                <Pencil className="mr-1 size-3.5" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(c.id)}
                              >
                                <Trash2 className="mr-1 size-3.5" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
