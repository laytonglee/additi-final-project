"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  BarChart3,
  Users,
  Briefcase,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

const metrics = [
  {
    icon: Users,
    label: "Freelancers",
    value: "100+",
  },
  {
    icon: Briefcase,
    label: "Projects Posted",
    value: "200+",
  },
  {
    icon: DollarSign,
    label: "Average Project Budget",
    value: "$250",
  },
  {
    icon: Star,
    label: "Client Satisfaction",
    value: "4.5 / 5",
  },
];

const categories = [
  { name: "Web Development", pct: 40 },
  { name: "UI / UX Design", pct: 22 },
  { name: "Mobile Development", pct: 18 },
  { name: "AI / Data", pct: 12 },
  { name: "Other", pct: 8 },
];

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Node.js",
  "Figma",
  "UI Design",
];

const activity = [
  {
    icon: CheckCircle,
    text: "Project successfully completed",
    time: "2 minutes ago",
  },
  {
    icon: DollarSign,
    text: "Payment released to freelancer",
    time: "12 minutes ago",
  },
  {
    icon: Star,
    text: "New 5-star review posted",
    time: "1 hour ago",
  },
  {
    icon: Briefcase,
    text: "New project posted",
    time: "3 hours ago",
  },
];

function MetricCard({ icon: Icon, label, value }: any) {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="pt-2 text-center">
        <Icon className="mx-auto text-primary mb-3" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        {/* Hero */}

        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 px-8 py-12 text-center">
          <motion.div
            className="absolute -top-12 -right-12 size-48 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-8 -left-8 size-36 bg-primary/8 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          <motion.div
            className="relative inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-5"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BarChart3 className="size-3.5" />
            Live marketplace signals
          </motion.div>

          <motion.h1
            className="relative text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            Khmerlance Insights
          </motion.h1>

          <motion.p
            className="relative text-muted-foreground text-lg max-w-xl mx-auto mb-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            Explore platform trends, category momentum, and marketplace activity
            across the freelance ecosystem.
          </motion.p>

          <motion.div
            className="relative flex justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.35 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg">
                <Link href="/projects">Browse Projects</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">Explore Talent</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Metrics */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Category breakdown */}

        <Card>
          <CardHeader>
            <CardTitle>Popular Project Categories</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {categories.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trending skills */}

        <Card>
          <CardHeader>
            <CardTitle>Trending Skills</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Activity */}

        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-8 bg-muted rounded-md flex items-center justify-center">
                  <a.icon className="size-4 text-primary" />
                </div>

                <div className="flex-1 text-sm">{a.text}</div>

                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {a.time}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
