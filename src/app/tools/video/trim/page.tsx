import type { Metadata } from "next"; import { VideoToolWorkspace } from "@/features/video/video-tool-workspace";
export const metadata: Metadata = { title: "Video Trimmer", description: "Trim and preview a precise video selection." };
export default function Page() { return <VideoToolWorkspace mode="trim" />; }
