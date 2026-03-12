"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const fieldVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to the appropriate dashboard based on the user's role
      const state = useAuthStore.getState();
      if (state.isAdmin()) {
        router.push("/admin");
      } else if (state.isClient()) {
        router.push("/client/dashboard");
      } else if (state.isFreelancer()) {
        router.push("/freelancer/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      /* error is handled in store */
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn("flex flex-col", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.07, delayChildren: 0.15 },
        },
      }}
    >
      <FieldGroup>
        <motion.div
          className="flex flex-col items-center gap-1 text-center"
          variants={fieldVariant}
        >
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-destructive/60 hover:text-destructive transition"
            >
              ✕
            </button>
          </motion.div>
        )}

        <motion.div variants={fieldVariant}>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <Field>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Signing in…" : "Login"}
            </Button>
          </Field>
        </motion.div>

        <motion.div variants={fieldVariant}>
          <Field>
            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </FieldDescription>
          </Field>
        </motion.div>
      </FieldGroup>
    </motion.form>
  );
}
