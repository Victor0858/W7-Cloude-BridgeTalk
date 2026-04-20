/** @type {import('next').NextConfig} */
const WORKER_URL = process.env.WORKER_URL ?? 'http://localhost:8787';

const nextConfig = {
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
