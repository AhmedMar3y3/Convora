import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Clock3, LockKeyhole } from "lucide-react";
import Link from "next/link";

export function UpcomingCategoryPage({
  name,
  eyebrow,
  description,
  icon: Icon,
  tools,
}: {
  name: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  tools: string[];
}) {
  return (
    <main>
      <section className="mx-auto grid min-h-[520px] w-[min(1120px,calc(100%-2rem))] items-center gap-12 py-20 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-[var(--foreground)]"><ArrowLeft size={16} /> All categories</Link>
          <div className="mt-10 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            <Icon size={20} /> {eyebrow}
          </div>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] md:text-7xl">{name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{description}</p>
          <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-muted">
            <Clock3 size={16} /> Coming soon
          </span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {tools.map((tool) => (
            <div key={tool} className="flex min-h-32 flex-col justify-between bg-[var(--surface-strong)] p-5">
              <span className="font-semibold">{tool}</span>
              <span className="mt-6 text-xs font-medium text-muted">In development</span>
            </div>
          ))}
        </div>
      </section>
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-start gap-4 py-10">
          <LockKeyhole className="mt-1 shrink-0 text-[var(--accent-strong)]" size={22} />
          <div><h2 className="font-semibold">The same private foundation</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">This workspace will require no account and keep no permanent file history. Files will be processed for the active request and released when the result is returned.</p></div>
        </div>
      </section>
    </main>
  );
}
