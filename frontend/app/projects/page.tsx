"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Data Science",
  "Other",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params =
          category === "All"
            ? { page, size: 12 }
            : { category, page, size: 12 };
        const res = await projectApi.search(params);
        const data = res.data.data as PageData<ProjectData>;
        setProjects(data.content);
        setTotalPages(data.totalPages);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, category]);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Browse Projects
          </h1>
        </motion.div>

        {/* Category filters */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategory(cat);
                setPage(0);
              }}
              className="rounded-full"
            >
              {cat}
            </Button>
          ))}
        </motion.div>

        {/* Project grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            className="text-center py-20 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No projects found. Try a different category.
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${page}`}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35 },
                    },
                  }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="secondary">{project.category}</Badge>
                          <Badge
                            variant={
                              project.status === "OPEN" ? "default" : "outline"
                            }
                            className={
                              project.status === "OPEN"
                                ? "bg-green-600 hover:bg-green-600"
                                : ""
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            ${project.budgetMin} – ${project.budgetMax}
                          </span>
                          <span>{project.proposalCount} proposals</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          by {project.clientName} ·{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex justify-center items-center gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
