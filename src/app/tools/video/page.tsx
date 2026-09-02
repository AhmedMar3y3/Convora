import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { videoTools } from "@/tools/registry";

export const metadata: Metadata = { title: "Video Tools", description: "Convert, compress, trim, and extract audio from videos privately with Convora." };

export default function VideoToolsPage() {
  return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Video</p><h1 className="mt-3 text-4xl font-semibold md:text-6xl">Video tools, cut to the point.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">Convert, reduce, trim, and extract sound in focused workspaces with private request-time processing.</p><div className="mt-10 grid gap-4 md:grid-cols-2">{videoTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></main>;
}
