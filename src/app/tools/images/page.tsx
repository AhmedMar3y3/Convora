import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/tools/registry";

export const metadata: Metadata = {
  title: "Image Tools",
  description: "Convert, compress, resize, crop, watermark, transform, inspect, sanitize, and turn images into PDF privately with Convora.",
  alternates: { canonical: "/tools/images" },
  openGraph: {
    title: "Image Tools | Convora",
    description: "Private browser-friendly image tools powered by Convora.",
    url: "/tools/images",
  },
};

export default function ImageToolsPage() {
  return (
    <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Images</p>
      <h1 className="mt-3 text-4xl font-semibold md:text-6xl">Image tools that feel finished.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">A complete runtime image workspace for formats, layout, branding, privacy, and document output.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </main>
  );
}
