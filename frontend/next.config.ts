import type { NextConfig } from 'next';

const WORKER_URL = process.env.WORKER_URL ?? 'http://localhost:8787';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${WORKER_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
