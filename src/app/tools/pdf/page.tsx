import type { Metadata } from "next";
import { Layers3 } from "lucide-react";
import { UpcomingCategoryPage } from "@/components/upcoming-category-page";

export const metadata: Metadata = { title: "PDF Tools", description: "Upcoming private PDF tools from Convora." };

export default function PdfToolsPage() {
  return <UpcomingCategoryPage name="PDF" eyebrow="PDF tools" description="Create, combine, separate, protect, and extract PDF files through one consistent workflow." icon={Layers3} tools={["PDF converter", "Merge PDF", "Split PDF", "Protect PDF"]} />;
}
