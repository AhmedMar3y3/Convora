import type { Metadata } from "next";
import { FileVideo } from "lucide-react";
import { UpcomingCategoryPage } from "@/components/upcoming-category-page";

export const metadata: Metadata = { title: "Video Tools", description: "Upcoming private video tools from Convora." };

export default function VideoToolsPage() {
  return <UpcomingCategoryPage name="Video" eyebrow="Video tools" description="Convert, resize, trim, and optimize video files for the web, social platforms, and your archive." icon={FileVideo} tools={["Video converter", "Video compressor", "Video resizer", "Video trimmer"]} />;
}
