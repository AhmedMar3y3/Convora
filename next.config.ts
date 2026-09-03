import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "ffmpeg-static"],
  outputFileTracingIncludes: { "/api/audio/process": ["./node_modules/ffmpeg-static/**"] },
  webpack(config) {
    config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    return config;
  },
};

export default nextConfig;
