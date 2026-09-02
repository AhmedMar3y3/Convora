import type { Metadata } from "next";
import { AudioToolWorkspace } from "@/features/audio/audio-tool-workspace";
export const metadata: Metadata = { title: "Audio Merger", description: "Reorder, trim, and merge audio clips into one file." };
export default function Page() { return <AudioToolWorkspace mode="merge" />; }
