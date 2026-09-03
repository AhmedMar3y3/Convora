import type { Metadata } from "next";
import { Layers3, LockKeyhole } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { pdfTools } from "@/tools/registry";

export const metadata: Metadata = { title: "Free PDF Tools", description: "Convert, edit, protect, merge, split, organize, and compress PDFs privately in your browser." };

export default function PdfToolsPage() {
  return <main><section className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20"><div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]"><Layers3 size={20} /> PDF tools</div><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] md:text-7xl">Every document, ready for what comes next.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Convert Office files and HTML, rebuild editable documents, annotate, secure, combine, separate, and optimize PDFs.</p><div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{pdfTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></section><section className="border-y border-[var(--border)] bg-[var(--surface)]"><div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-start gap-4 py-10"><LockKeyhole className="mt-1 shrink-0 text-[var(--accent-strong)]" size={22} /><div><h2 className="font-semibold">Private by design</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Processing happens in your browser. Convora does not upload files to a server, retain passwords, or keep a permanent copy.</p></div></div></section></main>;
}
