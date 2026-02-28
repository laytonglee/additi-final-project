"use client";

import { motion } from "framer-motion";

export default function InsightsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-200">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center"
      >
        <motion.h1
          className="text-4xl font-bold mb-4 text-orange-700"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        >
          Insights & Analytics
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Track your project stats, earnings, and performance. Visualize your growth and make data-driven decisions for your freelance journey.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold shadow hover:bg-orange-700 transition"
        >
          View Insights
        </motion.button>
      </motion.div>
    </div>
  );
}
