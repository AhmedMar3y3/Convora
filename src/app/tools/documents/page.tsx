import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { UpcomingCategoryPage } from "@/components/upcoming-category-page";

export const metadata: Metadata = { title: "Document Tools", description: "Upcoming private document tools from Convora." };

export default function DocumentToolsPage() {
  return <UpcomingCategoryPage name="Documents" eyebrow="Document tools" description="Convert, merge, split, and organize office documents without accounts or permanent storage." icon={FileText} tools={["Document converter", "Document merger", "Page extractor", "File organizer"]} />;
}
