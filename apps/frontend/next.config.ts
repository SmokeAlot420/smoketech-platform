import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude FFmpeg binary packages from bundling (server-side only)
  serverExternalPackages: [
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    '@ffprobe-installer/ffprobe'
  ],
};

export default nextConfig;
