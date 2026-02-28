import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public bucket URLs (pub-*.r2.dev)
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        // Allow any https hostname so custom R2 domains work too
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
