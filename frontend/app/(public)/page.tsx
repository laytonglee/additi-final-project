"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
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
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

export default function HomePage() {
  const { user, isClient, isFreelancer } = useAuthStore();

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-3.5rem)]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
            <motion.h1
              className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Connect. Collaborate. Create.
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.12}
            >
              FreelanceHub brings clients and freelancers together. Post
              projects, submit proposals, manage contracts, and grow your career
              — all in one place.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.24}
            >
              {user ? (
                <>
                  {isClient() && (
                    <Button
                      size="lg"
                      variant="secondary"
                      className="font-semibold"
                      asChild
                    >
                      <Link href="/post-project">Post a Project</Link>
                    </Button>
                  )}
                  {isFreelancer() && (
                    <Button
                      size="lg"
                      variant="secondary"
                      className="font-semibold"
                      asChild
                    >
                      <Link href="/projects">Find Work</Link>
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold"
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
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-semibold"
                    asChild
                  >
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold"
                    asChild
                  >
                    <Link href="/projects">Browse Projects</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-16 border-b">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: "10K+", label: "Freelancers" },
              { icon: Briefcase, value: "4K+", label: "Projects Posted" },
              { icon: CheckCircle, value: "95%", label: "Success Rate" },
              { icon: Globe, value: "120+", label: "Countries" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
              >
                <div className="flex justify-center mb-2">
                  <s.icon className="text-primary size-6" />
                </div>

                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-center text-foreground mb-12"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
            >
              How It Works
            </motion.h2>
            <AnimatedList className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: FileText,
                  title: "Post a Project",
                  desc: "Clients describe what they need, set a budget, and choose a deadline.",
                },
                {
                  icon: Handshake,
                  title: "Get Proposals",
                  desc: "Freelancers pitch their skills and set their price. Accept the best fit.",
                },
                {
                  icon: CheckCircle,
                  title: "Collaborate & Pay",
                  desc: "Work together via contracts, chat in real-time, and leave reviews.",
                },
              ].map((f) => (
                <AnimatedItem key={f.title}>
                  <Card className="text-center hover:shadow-lg transition-shadow border-border/50 h-full ">
                    <CardHeader className="items-center py-6 ">
                      <motion.div
                        className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-2"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <f.icon className="size-7 text-primary" />
                      </motion.div>
                      <CardTitle className="text-xl">{f.title}</CardTitle>
                      <CardDescription className="text-base">
                        {f.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </AnimatedItem>
              ))}
            </AnimatedList>
          </div>
        </section>

        {/* FOR FREELANCERS */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
            {/* Visual Card */}
            <motion.div
              className="bg-card border rounded-2xl p-8 shadow-sm space-y-6"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <h3 className="font-semibold text-lg">
                Why Freelancers Love FreelanceHub
              </h3>

              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary size-5 mt-0.5" />
                  <span>Access projects from clients worldwide</span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary size-5 mt-0.5" />
                  <span>Build a professional portfolio</span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary size-5 mt-0.5" />
                  <span>Secure payments and contracts</span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary size-5 mt-0.5" />
                  <span>Grow your freelance career</span>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.2}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Find Your Next
                <span className="text-primary"> Freelance Opportunity</span>
              </h2>

              <p className="text-muted-foreground mb-6 max-w-md">
                Discover projects that match your expertise and collaborate with
                clients from around the world.
              </p>

              <Button size="lg" asChild>
                <Link href="/projects">
                  Browse Projects
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          className="py-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              variants={fadeUp}
              custom={0.1}
            >
              Ready to Start Your Freelance Journey?
            </motion.h2>

            <motion.p
              className="text-primary-foreground/80 mb-10"
              variants={fadeUp}
              custom={0.2}
            >
              Join thousands of freelancers and clients collaborating on amazing
              projects around the world.
            </motion.p>

            {!user && (
              <motion.div
                variants={fadeUp}
                custom={0.3}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold px-8"
                  asChild
                >
                  <Link href="/register">
                    Create Your Account
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-black py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            © {new Date().getFullYear()} FreelanceHub. All rights reserved.
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
