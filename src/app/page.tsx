import { ArrowRight, Check, CloudOff, Gift, Layers3, LockKeyhole, MousePointerClick, Sparkles, UserRoundX, Zap } from "lucide-react";
import Image from "next/image";
import { Brand } from "@/components/brand";
import { LinkButton } from "@/components/button";

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-[min(1120px,calc(100%-2rem))] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-muted backdrop-blur">
            <Sparkles size={16} aria-hidden />
            Free file tools, built around privacy
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] md:text-7xl">Everything your files need. Nothing they do not.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Convora brings conversion, compression, editing, and organization into one calm workspace for every file type.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/tools">Explore all tools <ArrowRight size={18} aria-hidden /></LinkButton>
            <LinkButton href="/tools/images" variant="secondary">Use image tools</LinkButton>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted">
            <span className="flex items-center gap-2"><Check size={16} className="text-[var(--accent-strong)]" /> Free to use</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-[var(--accent-strong)]" /> No account</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-[var(--accent-strong)]" /> No permanent storage</span>
          </div>
        </div>

        <div className="relative grid min-h-[480px] place-items-center" aria-label="Convora supports every kind of file">
          <div className="absolute inset-8 rounded-full border border-[var(--border)]" />
          <div className="absolute inset-24 rounded-full border border-dashed border-[var(--border)]" />
          <span className="absolute left-4 top-20 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold shadow-lg">Documents</span>
          <span className="absolute right-0 top-28 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold shadow-lg">Images</span>
          <span className="absolute bottom-24 left-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold shadow-lg">Audio</span>
          <span className="absolute bottom-16 right-5 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold shadow-lg">Video</span>
          <div className="relative grid size-52 place-items-center rounded-full bg-[var(--surface-strong)] shadow-[var(--shadow)]">
            <span className="relative size-36" aria-hidden>
              <Image src="/convora-mark-light.png" alt="" fill sizes="144px" className="brand-mark-light object-contain" priority />
              <Image src="/convora-mark-dark.png" alt="" fill sizes="144px" className="brand-mark-dark object-contain" priority />
            </span>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid w-[min(1120px,calc(100%-2rem))] divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
          <Promise icon={Gift} title="Completely free" copy="No subscriptions, credits, trials, or artificial usage gates." />
          <Promise icon={UserRoundX} title="No account needed" copy="Open a tool and get the work done without giving us your identity." />
          <Promise icon={CloudOff} title="No file inventory" copy="Your uploads are processed for the request, not collected into a library." />
        </div>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%-2rem))] py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">A better utility layer</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">One experience across every tool.</h2>
          <p className="mt-5 text-lg leading-8 text-muted">No cluttered tool directories and no different workflow every time the extension changes. Convora keeps the interaction familiar while each tool stays focused.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <Value icon={MousePointerClick} title="Direct" copy="Choose a tool, add your files, make the change, and download. Every screen earns its place." />
          <Value icon={Layers3} title="Consistent" copy="Images are available first. Documents, voice, PDF, video, and archives will follow the same clear system." />
          <Value icon={Zap} title="Fast" copy="Focused controls and request-time processing keep the path between input and result short." />
        </div>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%-2rem))] py-16">
        <div className="relative overflow-hidden rounded-[8px] border border-[var(--border)] bg-[#071b19] px-7 py-12 text-white shadow-[var(--shadow)] md:px-14 md:py-16">
          <LockKeyhole className="mb-8 text-[#30d5c8]" size={38} aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8ff3eb]">Private by design</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold md:text-5xl">Your files are work, not inventory.</h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#c5d4d1]">
            No accounts, no file history, and no permanent storage. Convora validates each upload, processes it for the active request, returns the result, and releases the request resources.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {["No signup", "No tracking library", "No permanent uploads", "No paid framework"].map((item) => (
              <span key={item} className="rounded-full border border-white/20 bg-white/7 px-4 py-2 text-sm font-semibold text-white">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Images are ready now</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold md:text-5xl">Start with the tools already shipping.</h2>
        <p className="mx-auto mt-5 max-w-xl text-muted">Convert, compress, resize, and crop images with batch support and matching input and output formats.</p>
        <LinkButton href="/tools" className="mt-8">Go to tools <ArrowRight size={18} /></LinkButton>
      </section>

      <footer className="mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-col justify-between gap-4 border-t border-[var(--border)] py-10 text-sm text-muted md:flex-row md:items-center">
        <Brand />
        <span>Free tools. Private files. Clear work.</span>
      </footer>
    </main>
  );
}

function Promise({ icon: Icon, title, copy }: { icon: typeof Gift; title: string; copy: string }) {
  return <div className="px-7 py-8 md:px-9"><Icon size={22} className="text-[var(--accent-strong)]" /><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{copy}</p></div>;
}

function Value({ icon: Icon, title, copy }: { icon: typeof Gift; title: string; copy: string }) {
  return <article><span className="grid size-12 place-items-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Icon size={22} /></span><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{copy}</p></article>;
}
