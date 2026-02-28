"use client";

import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Link from "next/link";

export default function ExplorePage() {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-background rounded-2xl shadow-xl border border-border/50 p-10 max-w-lg w-full text-center mx-4"
        >
          <motion.div
            className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          >
            <span className="text-3xl">🔭</span>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold mb-4 text-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Explore Opportunities
          </motion.h1>

          <motion.p
            className="text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            Discover trending projects, top freelancers, and new clients. Use
            filters and search to find your next big thing!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.35 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/projects"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:bg-primary/90 transition-colors"
              >
                Start Exploring
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
