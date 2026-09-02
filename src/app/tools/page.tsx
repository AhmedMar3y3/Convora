import type { Metadata } from "next";
import { ArrowRight, FileAudio, FileImage, FileText, FileVideo, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "File Tool Categories",
  description: "Choose Convora tools for images, audio, documents, PDF, and video.",
};

const categories = [
  { name: "Image", href: "/tools/images", description: "Convert, compress, resize, and crop images.", status: "Available now", Icon: FileImage, active: true },
  { name: "Audio", href: "/tools/audio", description: "Convert, compress, trim, and merge audio.", status: "Available now", Icon: FileAudio, active: true },
  { name: "Documents", href: "/tools/documents", description: "Convert, merge, split, and organize documents.", status: "Coming soon", Icon: FileText },
  { name: "PDF", href: "/tools/pdf", description: "Create, merge, split, and protect PDF files.", status: "Coming soon", Icon: Layers3 },
  { name: "Video", href: "/tools/video", description: "Convert, compress, resize, and trim video.", status: "Coming soon", Icon: FileVideo },
];

export default function ToolsPage() {
  return (
    <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-20">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-muted">
        <Sparkles size={16} /> Choose a workspace
      </div>
      <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.04] md:text-7xl">A place for every kind of file.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Each file category has its own focused workspace. Image tools are available today, with the remaining categories arriving independently.</p>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {categories.map(({ name, href, description, status, Icon, active }) => (
          <Link key={name} href={href} className={active ? "group rounded-[8px] border border-[var(--accent)] bg-[var(--accent-soft)] p-7" : "group rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-7 transition hover:border-[var(--accent)]"}>
            <div className="flex items-start justify-between gap-5">
              <span className="grid size-12 place-items-center rounded-[8px] bg-[var(--surface-strong)] text-[var(--accent-strong)]"><Icon size={23} /></span>
              <span className={active ? "text-xs font-semibold text-[var(--accent-strong)]" : "text-xs font-medium text-muted"}>{status}</span>
            </div>
            <div className="mt-10 flex items-end justify-between gap-6">
              <div><h2 className="text-2xl font-semibold">{name}</h2><p className="mt-2 text-sm leading-6 text-muted">{description}</p></div>
              <ArrowRight className="shrink-0 transition group-hover:translate-x-1" size={20} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
