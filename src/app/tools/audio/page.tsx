import type { Metadata } from "next";
import { FileAudio } from "lucide-react";
import { UpcomingCategoryPage } from "@/components/upcoming-category-page";

export const metadata: Metadata = { title: "Audio Tools", description: "Upcoming private audio and voice tools from Convora." };

export default function AudioToolsPage() {
  return <UpcomingCategoryPage name="Audio & Voice" eyebrow="Audio tools" description="Convert, trim, compress, clean, and prepare voice and audio files in a focused workspace." icon={FileAudio} tools={["Audio converter", "Audio compressor", "Voice trimmer", "Noise cleanup"]} />;
}
