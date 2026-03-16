"use client";

import { Suspense } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <motion.div className="hidden bg-slate-100 lg:flex items-center justify-center p-12">
        <img
          src="/work-home-concept-design.png"
          alt="Freelancer working from home"
          className="w-full max-w-lg object-contain"
        />
      </motion.div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <motion.div className="flex justify-center md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="/khmerlance-logo.png"
              alt="Khmerlance"
              width={180}
              height={52}
              className="w-auto object-contain"
            />
          </a>
        </motion.div>
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            className="w-full max-w-sm rounded-xl border-2 p-6"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Suspense>
              <LoginForm />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
