import type { Metadata } from "next"; import { VideoToolWorkspace } from "@/features/video/video-tool-workspace";
export const metadata: Metadata = { title: "Video Converter", description: "Convert video formats with resolution, quality, and FPS controls." };
export default function Page() { return <VideoToolWorkspace mode="convert" />; }
