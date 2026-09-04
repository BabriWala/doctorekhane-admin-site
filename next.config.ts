import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://127.0.0.1:4002/api");
    return [{ source: "/api/:path*", destination: `${backend.replace(/\/$/, "")}/:path*` }];
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // 👈 disables type checking during build
  },
};

export default nextConfig;
