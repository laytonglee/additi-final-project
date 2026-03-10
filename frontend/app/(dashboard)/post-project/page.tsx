"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { projectApi } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Data Science",
  "Other",
];

const fieldVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function PostProjectPage() {
  useRequireAuth("CLIENT");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Web Development",
    projectType: "FIXED_PRICE",
    experienceLevel: "INTERMEDIATE",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (Number(form.budgetMin) > Number(form.budgetMax)) {
      setError("Minimum budget cannot exceed maximum budget.");
      setLoading(false);
      return;
    }

    try {
      const res = await projectApi.create({
        title: form.title,
        description: form.description,
        category: form.category,
        projectType: form.projectType,
        experienceLevel: form.experienceLevel,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        deadline: form.deadline || undefined,
      });
      router.push(`/projects/${res.data.data.id}`);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create project",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Post a New Project
          </h1>
          <p className="text-muted-foreground">
            Describe your project and freelancers will send you proposals.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6"
          >
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Fill in the details to attract the right freelancers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
                  },
                }}
              >
                <motion.div className="space-y-2" variants={fieldVariant}>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    required
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. Build an e-commerce website"
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={fieldVariant}>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    required
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    placeholder="Describe what you need in detail…"
                    className="resize-none"
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={fieldVariant}>
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(val) => update("category", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 gap-4"
                  variants={fieldVariant}
                >
                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select
                      value={form.projectType}
                      onValueChange={(val) => update("projectType", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={form.experienceLevel}
                      onValueChange={(val) => update("experienceLevel", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRY">Entry</SelectItem>
                        <SelectItem value="INTERMEDIATE">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 gap-4"
                  variants={fieldVariant}
                >
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Min Budget ($)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      required
                      min={1}
                      value={form.budgetMin}
                      onChange={(e) => update("budgetMin", e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Max Budget ($)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      required
                      min={1}
                      value={form.budgetMax}
                      onChange={(e) => update("budgetMax", e.target.value)}
                      placeholder="500"
                    />
                  </div>
                </motion.div>

                <motion.div className="space-y-2" variants={fieldVariant}>
                  <Label htmlFor="deadline">Deadline (optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => update("deadline", e.target.value)}
                  />
                </motion.div>

                <motion.div variants={fieldVariant}>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {loading ? "Creating…" : "Post Project"}
                  </Button>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
