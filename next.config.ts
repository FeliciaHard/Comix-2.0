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
      {
        protocol: 'https',
        hostname: 'iv1.lisimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fkul8-1.fna.fbcdn.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images-cdn.ubuy.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'assets.zhainanle.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
