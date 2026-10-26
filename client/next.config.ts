import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/ml/:path*',
        destination: `${process.env.ML_API_INTERNAL_URL ?? 'http://127.0.0.1:8000/api/v1'}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
    unoptimized: true,
  },
  allowedDevOrigins: ['*'],
};

export default nextConfig;
