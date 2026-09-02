import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { dataTools } from "@/tools/registry";

export const metadata: Metadata = { title: "Data Tools", description: "Private browser-based CSV, JSON, and Excel tools for conversion, formatting, merging, splitting, and deduplication." };
export default function DataToolsPage() { return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Data</p><h1 className="mt-3 text-4xl font-semibold md:text-6xl">Structured data, minus the friction.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">Convert, inspect, combine, divide, and clean CSV, JSON, and Excel files locally in your browser.</p><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{dataTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></main>; }
