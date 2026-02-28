"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";

const fieldVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "FREELANCER" as "FREELANCER" | "CLIENT",
    password: "",
    confirmPassword: "",
    bio: "",
    skills: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    try {
      await register(form);
      router.push("/login");
    } catch {
      /* error is handled in store */
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
            >
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Join FreelanceHub as a client or freelancer
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span className="flex-1">{localError || error}</span>
                <button
                  onClick={() => {
                    clearError();
                    setLocalError("");
                  }}
                  className="text-destructive/60 hover:text-destructive transition"
                >
                  ✕
                </button>
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.07, delayChildren: 0.2 },
                },
              }}
            >
              {/* Role selector */}
              <motion.div className="space-y-2" variants={fieldVariant}>
                <Label>I want to…</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "CLIENT",
                      label: "Hire Freelancers",
                      desc: "Post projects & manage talent",
                      icon: Users,
                    },
                    {
                      value: "FREELANCER",
                      label: "Work as Freelancer",
                      desc: "Find projects & earn money",
                      icon: Briefcase,
                    },
                  ].map((opt) => (
                    <motion.button
                      type="button"
                      key={opt.value}
                      onClick={() => update("role", opt.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        form.role === opt.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <opt.icon
                        className={`size-5 mb-2 ${
                          form.role === opt.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div className="font-semibold text-foreground text-sm">
                        {opt.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {opt.desc}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={fieldVariant}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={fieldVariant}
              >
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              {form.role === "FREELANCER" && (
                <motion.div
                  className="space-y-2"
                  variants={fieldVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={form.skills}
                    onChange={(e) => update("skills", e.target.value)}
                    placeholder="React, Node.js, Figma"
                  />
                </motion.div>
              )}

              <motion.div className="space-y-2" variants={fieldVariant}>
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself…"
                  className="resize-none"
                />
              </motion.div>

              <motion.div variants={fieldVariant}>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {loading ? "Creating account…" : "Create Account"}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>

          <CardFooter className="justify-center">
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
