/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@tensorflow-models/pose-detection', '@mediapipe/pose'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
