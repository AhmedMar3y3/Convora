import type { Metadata } from "next"; import { VideoToolWorkspace } from "@/features/video/video-tool-workspace";
export const metadata: Metadata = { title: "Video to Audio", description: "Extract audio from video as MP3, WAV, AAC, M4A, or FLAC." };
export default function Page() { return <VideoToolWorkspace mode="audio" />; }
