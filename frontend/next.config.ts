import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone build for Docker
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
};

export default nextConfig;
