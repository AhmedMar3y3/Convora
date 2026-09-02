import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { securityTools } from "@/tools/registry";

export const metadata: Metadata = { title: "Security Tools", description: "Private browser-based tools for file encryption, decryption, checksums, and password generation." };
export default function SecurityPage() { return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Security</p><h1 className="mt-3 text-4xl font-semibold md:text-6xl">Protect files. Verify what matters.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">Encrypt, decrypt, hash, and generate passwords entirely in your browser. Your files and secrets never leave this device.</p><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{securityTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></main>; }
