import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "ffmpeg-static"],
  outputFileTracingIncludes: { "/api/audio/process": ["./node_modules/ffmpeg-static/**"] },
};

export default nextConfig;
