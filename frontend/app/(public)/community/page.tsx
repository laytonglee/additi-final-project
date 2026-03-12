"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Heart,
  BookOpen,
  Award,
  TrendingUp,
  Users,
  HelpCircle,
  Lightbulb,
  Coffee,
  Star,
  Flame,
  ArrowRight,
} from "lucide-react";

const discussions = [
  {
    id: 1,
    category: "Tips & Tricks",
    categoryColor: "bg-blue-500/10 text-blue-600",
    title: "How I went from $0 to $10K/month freelancing in 18 months",
    author: "Alex M.",
    replies: 42,
    likes: 178,
    hot: true,
    time: "2h ago",
  },
  {
    id: 2,
    category: "Showcase",
    categoryColor: "bg-green-500/10 text-green-600",
    title: "Just landed my first $5K project — here's what worked",
    author: "Sara C.",
    replies: 31,
    likes: 124,
    hot: true,
    time: "5h ago",
  },
  {
    id: 3,
    category: "Advice",
    categoryColor: "bg-purple-500/10 text-purple-600",
    title: "Proposal templates that actually get responses",
    author: "Dev K.",
    replies: 58,
    likes: 96,
    hot: false,
    time: "1d ago",
  },
  {
    id: 4,
    category: "Q&A",
    categoryColor: "bg-orange-500/10 text-orange-600",
    title: "How do you handle scope creep from clients?",
    author: "Mia T.",
    replies: 77,
    likes: 142,
    hot: false,
    time: "1d ago",
  },
  {
    id: 5,
    category: "Tools",
    categoryColor: "bg-cyan-500/10 text-cyan-600",
    title: "Best tools for tracking freelance income and invoices in 2025",
    author: "James R.",
    replies: 34,
    likes: 88,
    hot: false,
    time: "2d ago",
  },
];

const channels = [
  {
    icon: Flame,
    label: "Trending",
    desc: "What everyone is reading",
    color: "text-orange-500",
  },
  {
    icon: HelpCircle,
    label: "Q&A",
    desc: "Get answers fast",
    color: "text-blue-500",
  },
  {
    icon: Lightbulb,
    label: "Tips & Tricks",
    desc: "Level up your freelancing",
    color: "text-yellow-500",
  },
  {
    icon: Award,
    label: "Showcase",
    desc: "Share your wins",
    color: "text-green-500",
  },
  {
    icon: BookOpen,
    label: "Resources",
    desc: "Templates & guides",
    color: "text-purple-500",
  },
  {
    icon: Coffee,
    label: "Off-topic",
    desc: "Just chatting",
    color: "text-pink-500",
  },
];

const members = [
  {
    name: "Alex Morgan",
    tag: "Top Contributor",
    avatar: "AM",
    color: "bg-blue-500",
    score: 2840,
  },
  {
    name: "Sara Chen",
    tag: "Rising Star",
    avatar: "SC",
    color: "bg-pink-500",
    score: 1950,
  },
  {
    name: "Dev Kapoor",
    tag: "Helper",
    avatar: "DK",
    color: "bg-violet-500",
    score: 1710,
  },
];

const stats = [
  { label: "Members", value: "8,200+", icon: Users },
  { label: "Discussions", value: "34,000+", icon: MessageSquare },
  { label: "Helpful replies", value: "120,000+", icon: Heart },
];

export default function CommunityPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 px-8 py-12 text-center">
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
            <Users className="size-3.5" />
            8,200+ active members
          </motion.div>

          <motion.h1
            className="relative text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            Your Freelance Community
          </motion.h1>

          <motion.p
            className="relative text-muted-foreground text-lg max-w-xl mx-auto mb-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            Learn from peers, share your wins, get advice from professionals,
            and grow your freelance career together.
          </motion.p>

          <motion.div
            className="relative flex justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.35 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg">Start a Discussion</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline">
                Browse Topics
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <AnimatedList className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <AnimatedItem key={s.label}>
              <Card className="text-center py-5">
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

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Discussions — 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Hot Discussions
              </h2>
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                View all <ArrowRight className="size-3.5" />
              </Button>
            </div>

            <AnimatedList className="space-y-3">
              {discussions.map((d) => (
                <AnimatedItem key={d.id}>
                  <Card className="hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer group">
                    <CardContent className="">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.categoryColor}`}
                            >
                              {d.category}
                            </span>
                            {d.hot && (
                              <span className="text-xs text-orange-500 flex items-center gap-0.5 font-medium">
                                <Flame className="size-3" />
                                Hot
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                            {d.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>by {d.author}</span>
                            <span>{d.time}</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="size-3" />
                              {d.replies}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="size-3" />
                              {d.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedItem>
              ))}
            </AnimatedList>
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-6">
            {/* Channels */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Channels</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {channels.map((ch) => (
                      <motion.div
                        key={ch.label}
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors group"
                      >
                        <ch.icon className={`size-4 ${ch.color} shrink-0`} />
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {ch.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ch.desc}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top contributors */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="size-4 text-yellow-500" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {members.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <div
                        className={`size-8 ${m.color} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}
                      >
                        {m.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {m.name}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {m.tag}
                        </Badge>
                      </div>
                      <div className="text-xs font-semibold text-primary">
                        {m.score}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Join CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Card className="bg-primary/5 border-primary/20 text-center p-6">
                <Star className="size-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">
                  Become a contributor
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Share knowledge and earn reputation points.
                </p>
                <Button size="sm" className="w-full">
                  <Link href="/register">Join Now</Link>
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
