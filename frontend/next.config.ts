import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["10.204.191.73", "10.*.*.*"],
};

export default nextConfig;
