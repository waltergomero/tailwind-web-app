import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
