import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { audioTools } from "@/tools/registry";

export const metadata: Metadata = { title: "Audio Tools", description: "Convert, compress, trim, and merge audio privately with Convora." };

export default function AudioToolsPage() {
  return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Audio</p><h1 className="mt-3 text-4xl font-semibold md:text-6xl">Audio tools with a pulse.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">Convert, reduce, cut, and combine audio in focused workspaces with waveform previews and private request-time processing.</p><div className="mt-10 grid gap-4 md:grid-cols-2">{audioTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></main>;
}
