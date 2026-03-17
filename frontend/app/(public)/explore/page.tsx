"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Code2,
  Palette,
  PenLine,
  Megaphone,
  Database,
  Smartphone,
  Globe,
  Star,
} from "lucide-react";

const categories = [
  {
    icon: Code2,
    label: "Web Dev",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    count: 842,
  },
  {
    icon: Smartphone,
    label: "Mobile",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    count: 391,
  },
  {
    icon: Palette,
    label: "Design",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    count: 517,
  },
  {
    icon: PenLine,
    label: "Writing",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    count: 264,
  },
  {
    icon: Megaphone,
    label: "Marketing",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    count: 198,
  },
  {
    icon: Database,
    label: "Data Science",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    count: 175,
  },
  {
    icon: Globe,
    label: "SEO",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    count: 143,
  },
  {
    icon: Sparkles,
    label: "AI / ML",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    count: 129,
  },
];

const trendingProjects = [
  {
    id: 1,
    title: "Build a SaaS dashboard in Next.js",
    budget: "$500 – $1,200",
    proposals: 14,
    tag: "Web Dev",
    hot: true,
  },
  {
    id: 2,
    title: "iOS app for grocery delivery",
    budget: "$2,000 – $5,000",
    proposals: 23,
    tag: "Mobile",
    hot: true,
  },
  {
    id: 3,
    title: "Brand identity redesign for startup",
    budget: "$300 – $700",
    proposals: 9,
    tag: "Design",
    hot: false,
  },
  {
    id: 4,
    title: "Machine learning model for churn prediction",
    budget: "$800 – $1,500",
    proposals: 7,
    tag: "Data Science",
    hot: true,
  },
  {
    id: 5,
    title: "SEO audit & content strategy",
    budget: "$200 – $400",
    proposals: 11,
    tag: "Marketing",
    hot: false,
  },
  {
    id: 6,
    title: "React Native fitness tracker",
    budget: "$1,500 – $3,500",
    proposals: 18,
    tag: "Mobile",
    hot: false,
  },
];

const topFreelancers = [
  {
    id: 1,
    name: "Alex Morgan",
    skill: "Full-Stack Developer",
    rating: 4.9,
    reviews: 87,
    avatar: "AM",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Sara Chen",
    skill: "UI/UX Designer",
    rating: 4.8,
    reviews: 62,
    avatar: "SC",
    color: "bg-pink-500",
  },
  {
    id: 3,
    name: "Dev Kapoor",
    skill: "Data Scientist",
    rating: 4.9,
    reviews: 41,
    avatar: "DK",
    color: "bg-violet-500",
  },
  {
    id: 4,
    name: "Mia Torres",
    skill: "Content Writer",
    rating: 4.7,
    reviews: 95,
    avatar: "MT",
    color: "bg-green-500",
  },
];

const stats = [
  { label: "Projects posted", value: "200+", icon: TrendingUp },
  { label: "Freelancers", value: "100+", icon: Users },
  { label: "Completed", value: "100+", icon: Star },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"projects" | "freelancers">(
    "projects",
  );

  const filteredProjects = trendingProjects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">
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
            <Sparkles className="size-3.5" />
            Discover projects, skills, and talent
          </motion.div>

          <motion.h1
            className="relative text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            Explore the Freelance Ecosystem
          </motion.h1>

          <motion.p
            className="relative text-muted-foreground text-lg max-w-xl mx-auto mb-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            Browse trending projects, discover standout freelancers, and find
            the next opportunity worth chasing.
          </motion.p>

          <motion.div
            className="relative flex justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.35 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg">
                <Link href="/projects">Browse All Projects</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">Join as Freelancer</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative max-w-lg mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-10 h-11 rounded-xl bg-background/80"
              placeholder="Search projects or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Platform stats */}
        <AnimatedList className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <AnimatedItem key={s.label}>
              <Card className="text-center py-6">
                <CardContent className="p-0">
                  <s.icon className="size-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </AnimatedList>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-5">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  href={`/projects?category=${encodeURIComponent(cat.label)}`}
                >
                  <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className=" text-center">
                      <div
                        className={`size-10 rounded-lg ${cat.color} flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110`}
                      >
                        <cat.icon className="size-5" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {cat.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {cat.count}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tabs: Projects / Freelancers */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">
              {activeTab === "projects"
                ? "Trending Projects"
                : "Top Freelancers"}
            </h2>
            <div className="flex gap-1 bg-muted/60 p-1 rounded-lg">
              {(["projects", "freelancers"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                    activeTab === tab
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-background rounded-md shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "projects" ? (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    whileHover={{ y: -2 }}
                  >
                    <Link href="/projects">
                      <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                        <CardContent className="">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <Badge
                              variant="secondary"
                              className="text-xs shrink-0"
                            >
                              {project.tag}
                            </Badge>
                            {project.hot && (
                              <Badge className="text-xs bg-orange-500 hover:bg-orange-500">
                                🔥 Hot
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground text-sm leading-snug mb-3">
                            {project.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {project.budget}
                            </span>
                            <span>{project.proposals} proposals</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="freelancers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {topFreelancers.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    whileHover={{ y: -3 }}
                  >
                    <Link href={`/profile/${f.id}`}>
                      <Card className="h-full text-center hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                        <CardContent className="pt-6 pb-5">
                          <div
                            className={`size-14 ${f.color} rounded-full flex items-center justify-center mx-auto mb-3 text-white text-lg font-bold`}
                          >
                            {f.avatar}
                          </div>
                          <h3 className="font-semibold text-foreground">
                            {f.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 mb-3">
                            {f.skill}
                          </p>
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <Star className="size-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold text-foreground">
                              {f.rating}
                            </span>
                            <span className="text-muted-foreground">
                              ({f.reviews})
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div
          className="rounded-2xl bg-primary/5 border border-primary/20 p-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Ready to dive in?
          </h2>
          <p className="text-muted-foreground mb-6">
            Post a project and get proposals from top freelancers within hours.
          </p>
          <div className="flex justify-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg">
                <Link href="/post-project">Post a Project</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" variant="outline">
                <Link href="/projects">Browse All Projects</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
