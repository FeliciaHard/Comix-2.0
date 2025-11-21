import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN || 'default-domain.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn1.telesco.pe',
        pathname: '/file/**',
      },
      {
        protocol: 'https',
        hostname: 'mundodeportivo.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'preview.redd.it',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
