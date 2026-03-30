import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  // Exclude API routes from static export
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Skip API routes during static export
  skipTrailingSlashRedirect: true,
  trailingSlash: true,
};

export default nextConfig;
