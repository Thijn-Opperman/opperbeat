import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuratie
  output: 'standalone',
  
  // Exclude node_modules dependencies die niet nodig zijn
  serverExternalPackages: ['ffmpeg-static', 'fluent-ffmpeg'],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
