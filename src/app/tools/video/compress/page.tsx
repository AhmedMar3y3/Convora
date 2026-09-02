import type { Metadata } from "next"; import { VideoToolWorkspace } from "@/features/video/video-tool-workspace";
export const metadata: Metadata = { title: "Video Compressor", description: "Compress video with simple quality presets and visible savings." };
export default function Page() { return <VideoToolWorkspace mode="compress" />; }
