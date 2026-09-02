import type { Metadata } from "next";
import { AudioToolWorkspace } from "@/features/audio/audio-tool-workspace";
export const metadata: Metadata = { title: "Audio Converter", description: "Convert MP3, WAV, AAC, M4A, FLAC, OGG, and OPUS audio." };
export default function Page() { return <AudioToolWorkspace mode="convert" />; }
