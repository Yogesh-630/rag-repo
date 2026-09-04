/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Only apply rewrites in local development (when API_URL points to localhost)
    // In production, the client calls the backend URL directly via NEXT_PUBLIC_API_URL
    if (API_URL.includes('localhost')) {
      return [
        {
          source: '/api/:path*',
          destination: `${API_URL}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${API_URL}/uploads/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
