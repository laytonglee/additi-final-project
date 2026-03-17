"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center gap-6">
      {/* Illustration */}
      <motion.div
        className="relative select-none"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* 404 text */}
        <p className="text-[10rem] sm:text-[13rem] font-black leading-none tracking-tighter text-foreground">
          404
        </p>

        {/* Cat + yarn SVG overlaid on the 0 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 260 260"
            className="w-52 sm:w-64 mt-4"
            fill="none"
          >
            {/* Body */}
            <ellipse cx="115" cy="155" rx="38" ry="46" fill="#d1d5db" />
            {/* Shirt stripe */}
            <ellipse cx="115" cy="165" rx="28" ry="18" fill="#374151" />
            <ellipse cx="115" cy="165" rx="22" ry="13" fill="#d1d5db" />

            {/* Head */}
            <ellipse cx="115" cy="100" rx="34" ry="30" fill="#d1d5db" />

            {/* Ears */}
            <polygon points="86,78 80,58 98,72" fill="#d1d5db" />
            <polygon points="144,78 150,58 132,72" fill="#d1d5db" />
            <polygon points="88,76 83,62 96,71" fill="#f9a8d4" />
            <polygon points="142,76 147,62 134,71" fill="#f9a8d4" />

            {/* Eyes */}
            <ellipse cx="104" cy="98" rx="6" ry="6" fill="white" />
            <ellipse cx="126" cy="98" rx="6" ry="6" fill="white" />
            <ellipse cx="104" cy="99" rx="3.5" ry="4" fill="#1f2937" />
            <ellipse cx="126" cy="99" rx="3.5" ry="4" fill="#1f2937" />
            <circle cx="105" cy="98" r="1.2" fill="white" />
            <circle cx="127" cy="98" r="1.2" fill="white" />

            {/* Nose */}
            <ellipse cx="115" cy="108" rx="3" ry="2" fill="#f9a8d4" />
            {/* Mouth */}
            <path
              d="M110 112 Q115 117 120 112"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Whiskers */}
            <line
              x1="85"
              y1="107"
              x2="108"
              y2="109"
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <line
              x1="85"
              y1="111"
              x2="108"
              y2="111"
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <line
              x1="122"
              y1="109"
              x2="145"
              y2="107"
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <line
              x1="122"
              y1="111"
              x2="145"
              y2="111"
              stroke="#9ca3af"
              strokeWidth="1"
            />

            {/* Left arm down */}
            <path
              d="M80 150 Q62 165 68 182"
              stroke="#d1d5db"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />
            {/* Paw left */}
            <ellipse cx="68" cy="184" rx="9" ry="7" fill="#d1d5db" />

            {/* Right arm raised */}
            <path
              d="M150 140 Q172 118 168 100"
              stroke="#d1d5db"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />
            {/* Paw right */}
            <ellipse cx="169" cy="98" rx="9" ry="7" fill="#d1d5db" />

            {/* Tail */}
            <path
              d="M148 190 Q170 220 155 240"
              stroke="#d1d5db"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />

            {/* Yarn ball */}
            <circle cx="90" cy="220" r="22" fill="#9ca3af" />
            <path
              d="M70 210 Q90 200 110 215"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M68 220 Q90 208 112 222"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M70 230 Q90 218 110 228"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M78 205 Q85 225 82 240"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M90 200 Q95 222 92 242"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M103 206 Q105 226 100 241"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Yarn string to paw */}
            <path
              d="M112 215 Q125 210 68 183"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Plant pot */}
            <rect
              x="190"
              y="210"
              width="36"
              height="28"
              rx="4"
              fill="#374151"
            />
            <rect x="185" y="207" width="46" height="8" rx="3" fill="#4b5563" />
            {/* Plant stem */}
            <line
              x1="208"
              y1="210"
              x2="208"
              y2="170"
              stroke="#6b7280"
              strokeWidth="3"
            />
            {/* Leaves */}
            <ellipse
              cx="196"
              cy="183"
              rx="14"
              ry="7"
              fill="#6b7280"
              transform="rotate(-30 196 183)"
            />
            <ellipse
              cx="220"
              cy="175"
              rx="14"
              ry="7"
              fill="#6b7280"
              transform="rotate(25 220 175)"
            />
            <ellipse
              cx="200"
              cy="168"
              rx="12"
              ry="6"
              fill="#9ca3af"
              transform="rotate(-15 200 168)"
            />
          </svg>
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        className="space-y-2 mt-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Page Not Found ⚠️</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t find the page you are looking for
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
      >
        <Button asChild size="lg" className="rounded-full px-8 font-semibold">
          <Link href="/">Back to home page</Link>
        </Button>
      </motion.div>
    </div>
  );
}
