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
import { FileText, Handshake, CheckCircle, ArrowRight } from "lucide-react";
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

        {/* Features */}
        <section className="py-20 bg-background">
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
                  <Card className="text-center hover:shadow-lg transition-shadow border-border/50 h-full">
                    <CardHeader className="items-center pt-8">
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

        {/* CTA */}
        <motion.section
          className="py-20 bg-muted/50"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of clients and freelancers building amazing things
              together.
            </p>
            {!user && (
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button size="lg" className="font-semibold" asChild>
                  <Link href="/register">Create Your Account</Link>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-foreground/95 text-background/60 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            © {new Date().getFullYear()} FreelanceHub. All rights reserved.
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
