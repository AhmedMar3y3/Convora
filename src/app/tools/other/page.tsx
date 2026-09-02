import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { otherTools } from "@/tools/registry";

export const metadata: Metadata = { title: "Other Tools", description: "Generate and scan QR codes and barcodes privately in your browser." };

export default function OtherToolsPage() {
  return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Other</p><h1 className="mt-3 text-4xl font-semibold md:text-6xl">Small tools. Everyday useful.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">Create and read QR codes and barcodes in focused, private workspaces. Your images stay in your browser.</p><div className="mt-10 grid gap-4 md:grid-cols-2">{otherTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></main>;
}
