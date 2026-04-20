import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '/tmp/.next-blazeneuro',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
