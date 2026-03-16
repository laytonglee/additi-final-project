"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  Handshake,
  CheckCircle,
  ArrowRight,
  Users,
  Briefcase,
  Globe,
  Star,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Footer } from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const stats = [
  { icon: Users, value: "10K+", label: "Freelancers" },
  { icon: Briefcase, value: "4K+", label: "Projects Posted" },
  { icon: CheckCircle, value: "95%", label: "Success Rate" },
  { icon: Globe, value: "120+", label: "Countries" },
];

const features = [
  {
    icon: FileText,
    title: "Post a Project",
    desc: "Describe your work, set your budget, and receive proposals from skilled freelancers.",
  },
  {
    icon: Handshake,
    title: "Hire Top Talent",
    desc: "Compare proposals, review portfolios, and hire the right freelancer with confidence.",
  },
  {
    icon: CheckCircle,
    title: "Collaborate Smoothly",
    desc: "Manage contracts, communicate in real time, and complete work efficiently.",
  },
];

const perks = [
  {
    icon: Zap,
    title: "Fast Hiring",
    desc: "Get matched with qualified freelancers quickly.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Contracts",
    desc: "Work with confidence through trusted workflows.",
  },
  {
    icon: Star,
    title: "Build Reputation",
    desc: "Grow your profile with reviews and completed projects.",
  },
  {
    icon: Globe,
    title: "Global Opportunities",
    desc: "Connect with clients and freelancers worldwide.",
  },
];

export default function HomePage() {
  const { user, isClient, isFreelancer } = useAuthStore();

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        {/* Background Decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-120px] top-[-120px] h-[280px] w-[280px] rounded-full bg-primary/20 blur-3xl sm:h-[320px] sm:w-[320px]" />
          <div className="absolute right-[-80px] top-[8%] h-[220px] w-[220px] rounded-full bg-fuchsia-500/10 blur-3xl sm:h-[260px] sm:w-[260px]" />
          <div className="absolute bottom-[-120px] left-[20%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl sm:h-[260px] sm:w-[260px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.03))]" />
        </div>

        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-20 lg:pt-24">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
              {/* Left */}
              <div className="order-2 lg:order-1">
                <motion.div
                  className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary sm:mb-6 sm:text-sm"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  Freelance platform for modern work
                </motion.div>

                <motion.h1
                  className="mb-5 text-3xl font-extrabold leading-[1.08] tracking-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.1}
                >
                  Hire smarter.
                  <br />
                  Work faster.
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary to-fuchsia-500 bg-clip-text text-transparent">
                    Grow together.
                  </span>
                </motion.h1>

                <motion.p
                  className="mb-6 max-w-xl text-sm leading-7 text-muted-foreground sm:mb-8 sm:text-base sm:leading-8 md:text-lg"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.2}
                >
                  KhmerLance helps clients and freelancers connect, collaborate,
                  and deliver successful projects through one clean and modern
                  workspace.
                </motion.p>

                <motion.div
                  className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.3}
                >
                  {user ? (
                    <>
                      {isClient() && (
                        <Button
                          size="lg"
                          className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                          asChild
                        >
                          <Link href="/post-project">
                            Post a Project
                            <ArrowRight className="ml-2 size-4" />
                          </Link>
                        </Button>
                      )}

                      {isFreelancer() && (
                        <Button
                          size="lg"
                          className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                          asChild
                        >
                          <Link href="/projects">
                            Find Work
                            <ArrowRight className="ml-2 size-4" />
                          </Link>
                        </Button>
                      )}

                      <Button
                        size="lg"
                        variant="outline"
                        className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                        asChild
                      >
                        <Link
                          href={
                            isClient()
                              ? "/client/dashboard"
                              : isFreelancer()
                                ? "/freelancer/dashboard"
                                : "/projects"
                          }
                        >
                          Go to Dashboard
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                        asChild
                      >
                        <Link href="/register">
                          Get Started Free
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                        asChild
                      >
                        <Link href="/projects">Browse Projects</Link>
                      </Button>
                    </>
                  )}
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground sm:gap-x-6 sm:text-sm"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.4}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Trusted by global users
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Secure collaboration
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    Built for growth
                  </div>
                </motion.div>
              </div>

              {/* Right */}
              <motion.div
                className="order-1 flex justify-center lg:order-2 lg:justify-end"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.25}
              >
                <div className="w-[92%] sm:w-[76%] md:w-[62%] lg:w-[95%] xl:w-[86%]">
                  <Image
                    src="/hero-section.png"
                    alt="Hero section illustration"
                    width={720}
                    height={540}
                    className="h-auto w-full object-cover "
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-8 sm:py-10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:gap-6 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="rounded-2xl border bg-card/70 p-4 text-center shadow-sm backdrop-blur-sm sm:p-5"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.08}
              >
                <div className="mb-3 flex justify-center">
                  <s.icon className="size-5 text-primary" />
                </div>
                <p className="text-xl font-bold sm:text-2xl md:text-3xl">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
                How it works
              </p>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
                Everything you need in one workflow
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                From posting projects to hiring talent and managing delivery,
                KhmerLance keeps the process simple and professional.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i * 0.12}
                >
                  <Card className="h-full rounded-3xl border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <CardHeader className="p-5 sm:p-6">
                      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-14">
                        <f.icon className="size-6 sm:size-7" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl">
                        {f.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-6 sm:text-base sm:leading-7">
                        {f.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-muted/30 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
                For freelancers
              </p>
              <h2 className="mb-5 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                Find better projects and build a stronger freelance career
              </h2>
              <p className="mb-8 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 md:text-lg">
                Work with clients worldwide, showcase your expertise, and manage
                everything from proposals to delivery in a clean modern
                platform.
              </p>

              <div className="mb-8 space-y-4">
                {[
                  "Access quality job opportunities",
                  "Showcase your portfolio professionally",
                  "Manage contracts and payments with confidence",
                  "Grow trust through reviews and completed work",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 text-primary" />
                    <span className="text-sm text-muted-foreground sm:text-base">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                asChild
              >
                <Link href="/projects">
                  Browse Projects
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.2}
            >
              {perks.map((perk) => (
                <Card
                  key={perk.title}
                  className="rounded-3xl border bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 sm:size-12">
                      <perk.icon className="size-5 text-primary sm:size-6" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold sm:text-lg">
                      {perk.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {perk.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="relative overflow-hidden rounded-[2rem] border bg-card px-5 py-12 text-center shadow-xl sm:px-8 sm:py-14 md:px-12 md:py-16"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-fuchsia-500/10" />
              <div className="relative">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
                  Start today
                </p>
                <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
                  Ready to build your next success story?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
                  Whether you are hiring talent or looking for your next
                  opportunity, KhmerLance gives you the tools to move faster.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                  {!user ? (
                    <>
                      <Button
                        size="lg"
                        className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                        asChild
                      >
                        <Link href="/register">
                          Get Started Free
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                        asChild
                      >
                        <Link href="/projects">Explore Projects</Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      className="h-11 w-full rounded-full px-6 sm:h-12 sm:w-auto sm:px-7"
                      asChild
                    >
                      <Link
                        href={
                          isClient()
                            ? "/client/dashboard"
                            : isFreelancer()
                              ? "/freelancer/dashboard"
                              : "/projects"
                        }
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
