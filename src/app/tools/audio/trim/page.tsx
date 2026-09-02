import type { Metadata } from "next";
import { AudioToolWorkspace } from "@/features/audio/audio-tool-workspace";
export const metadata: Metadata = { title: "Audio Trimmer", description: "Trim audio precisely with a waveform preview." };
export default function Page() { return <AudioToolWorkspace mode="trim" />; }
