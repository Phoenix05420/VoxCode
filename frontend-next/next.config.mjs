/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to the Flask/FastAPI backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'http://localhost:3001/ws/:path*',
      },
    ];
  },

  // Transpile specific packages
  transpilePackages: ['lucide-react'],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
