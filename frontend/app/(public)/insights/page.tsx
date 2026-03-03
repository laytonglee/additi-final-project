"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Star,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";

const periods = ["7 days", "30 days", "90 days", "All time"] as const;
type Period = (typeof periods)[number];

const metricsByPeriod: Record<
  Period,
  {
    revenue: string;
    projects: string;
    rating: string;
    clients: string;
    revChange: number;
    projChange: number;
  }
> = {
  "7 days": {
    revenue: "$2,450",
    projects: "4",
    rating: "4.9",
    clients: "3",
    revChange: 12,
    projChange: 33,
  },
  "30 days": {
    revenue: "$9,800",
    projects: "12",
    rating: "4.8",
    clients: "9",
    revChange: 8,
    projChange: -5,
  },
  "90 days": {
    revenue: "$24,600",
    projects: "31",
    rating: "4.8",
    clients: "24",
    revChange: 22,
    projChange: 15,
  },
  "All time": {
    revenue: "$87,300",
    projects: "114",
    rating: "4.9",
    clients: "68",
    revChange: 0,
    projChange: 0,
  },
};

// Simplified bar chart data
const earningsChart = [
  { month: "Sep", value: 6200, max: 10000 },
  { month: "Oct", value: 7400, max: 10000 },
  { month: "Nov", value: 5800, max: 10000 },
  { month: "Dec", value: 9100, max: 10000 },
  { month: "Jan", value: 7700, max: 10000 },
  { month: "Feb", value: 9800, max: 10000 },
];

const recentActivity = [
  {
    icon: CheckCircle,
    color: "text-green-500",
    label: "Contract completed",
    sub: "React Dashboard",
    time: "2h ago",
  },
  {
    icon: Star,
    color: "text-yellow-500",
    label: "New review received",
    sub: "★★★★★ by James R.",
    time: "5h ago",
  },
  {
    icon: Briefcase,
    color: "text-blue-500",
    label: "New proposal submitted",
    sub: "iOS App Project",
    time: "1d ago",
  },
  {
    icon: DollarSign,
    color: "text-green-500",
    label: "Payment received",
    sub: "$2,400 for SEO project",
    time: "1d ago",
  },
  {
    icon: Users,
    color: "text-primary",
    label: "New client message",
    sub: "from Mia Torres",
    time: "2d ago",
  },
];

const categoryBreakdown = [
  { label: "Web Development", pct: 48, color: "bg-blue-500" },
  { label: "UI/UX Design", pct: 22, color: "bg-pink-500" },
  { label: "Mobile", pct: 18, color: "bg-purple-500" },
  { label: "Other", pct: 12, color: "bg-muted-foreground/40" },
];

const topSkills = [
  {
    skill: "React / Next.js",
    count: 38,
    color: "bg-blue-500/10 text-blue-600",
  },
  { skill: "TypeScript", count: 29, color: "bg-indigo-500/10 text-indigo-600" },
  { skill: "Figma", count: 21, color: "bg-pink-500/10 text-pink-600" },
  { skill: "Node.js", count: 17, color: "bg-green-500/10 text-green-600" },
  { skill: "Python", count: 9, color: "bg-yellow-500/10 text-yellow-600" },
];

function Trend({ change }: { change: number }) {
  if (change === 0)
    return <span className="text-xs text-muted-foreground">—</span>;
  const up = change > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}
    >
      {up ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {Math.abs(change)}%
    </span>
  );
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("30 days");
  const m = metricsByPeriod[period];

  const keyMetrics = [
    {
      label: "Earnings",
      value: m.revenue,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-500/10",
      change: m.revChange,
    },
    {
      label: "Projects",
      value: m.projects,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      change: m.projChange,
    },
    {
      label: "Avg Rating",
      value: m.rating,
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      change: 0,
    },
    {
      label: "Clients",
      value: m.clients,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      change: 0,
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="size-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Insights & Analytics
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Track your earnings, performance, and growth.
            </p>
          </div>

          {/* Period switcher */}
          <div className="flex gap-1 bg-muted/60 p-1 rounded-xl self-start sm:self-auto">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  period === p
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period === p && (
                  <motion.span
                    layoutId="period-bg"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{p}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key metrics */}
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {keyMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <Card className="relative overflow-hidden h-full">
                  <CardContent className="pt-5 pb-4">
                    <div
                      className={`size-9 ${metric.bg} rounded-lg flex items-center justify-center mb-3`}
                    >
                      <metric.icon className={`size-5 ${metric.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {metric.value}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {metric.label}
                      </span>
                      <Trend change={metric.change} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Earnings bar chart + Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Monthly Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-3 h-36 pt-2">
                  {earningsChart.map((bar, i) => (
                    <div
                      key={bar.month}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="text-xs text-muted-foreground font-medium mb-1">
                        ${(bar.value / 1000).toFixed(1)}k
                      </div>
                      <motion.div
                        className="w-full rounded-t-md bg-primary/80 relative overflow-hidden"
                        style={{
                          originY: 1,
                          height: `${(bar.value / bar.max) * 100}%`,
                        }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                          delay: 0.3 + i * 0.06,
                          duration: 0.5,
                          ease: "easeOut",
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-primary to-primary/60"
                          initial={{ opacity: 0.5 }}
                          whileHover={{ opacity: 0.85 }}
                        />
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        {bar.month}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <div className={`mt-0.5 ${item.color} shrink-0`}>
                        <item.icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.sub}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Category breakdown + Top skills */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">
                        {cat.label}
                      </span>
                      <span className="text-muted-foreground">{cat.pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${cat.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        transition={{
                          delay: 0.4 + i * 0.08,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Top In-Demand Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList className="space-y-2">
                  {topSkills.map((s, i) => (
                    <AnimatedItem key={s.skill}>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`font-normal ${s.color}`}
                        >
                          {s.skill}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary/60 rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(s.count / topSkills[0].count) * 100}%`,
                              }}
                              transition={{
                                delay: 0.45 + i * 0.07,
                                duration: 0.5,
                                ease: "easeOut",
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-6 text-right">
                            {s.count}
                          </span>
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance summary */}
        <AnimatedList className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              label: "Completion Rate",
              value: "97%",
              sub: "114 completed / 117 total",
              color: "text-green-600",
            },
            {
              icon: Clock,
              label: "Avg. Delivery Time",
              value: "8.4 days",
              sub: "vs 12 days avg on platform",
              color: "text-blue-600",
            },
            {
              icon: Star,
              label: "Satisfaction Score",
              value: "4.9 / 5",
              sub: "based on 68 client reviews",
              color: "text-yellow-500",
            },
          ].map((item) => (
            <AnimatedItem key={item.label}>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <item.icon className={`size-5 ${item.color} mb-3`} />
                  <div className="text-2xl font-bold text-foreground mb-0.5">
                    {item.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.sub}
                  </div>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </div>
    </PageTransition>
  );
}
