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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-tabs',
      'recharts',
    ],
  },
};

export default nextConfig;
