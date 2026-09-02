import type { Metadata } from "next";
import { FileText, LockKeyhole } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { documentTools } from "@/tools/registry";

export const metadata: Metadata = { title: "Free Document Tools", description: "Extract, scan, view, sanitize, and compare documents privately with Convora." };

export default function DocumentToolsPage() {
  return <main><section className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20"><div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]"><FileText size={20} /> Document tools</div><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] md:text-7xl">Make documents easier to use.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Extract text, clean photographed pages, inspect files, remove hidden details, and compare revisions without an account.</p><div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{documentTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></section><section className="border-y border-[var(--border)] bg-[var(--surface)]"><div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-start gap-4 py-10"><LockKeyhole className="mt-1 shrink-0 text-[var(--accent-strong)]" size={22} /><div><h2 className="font-semibold">Designed around private work</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Document extraction, viewing, scanning, and comparison happen in your browser. Files are not added to an account or permanent library.</p></div></div></section></main>;
}
