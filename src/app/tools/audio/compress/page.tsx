import type { Metadata } from "next";
import { AudioToolWorkspace } from "@/features/audio/audio-tool-workspace";
export const metadata: Metadata = { title: "Audio Compressor", description: "Compress audio with bitrate control and visible file savings." };
export default function Page() { return <AudioToolWorkspace mode="compress" />; }
