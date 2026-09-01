import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Convora home">
      <span className="relative block size-11 shrink-0 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105" aria-hidden>
        <Image src="/convora-mark-light.png" alt="" fill sizes="44px" className="brand-mark-light object-contain" priority />
        <Image src="/convora-mark-dark.png" alt="" fill sizes="44px" className="brand-mark-dark object-contain" priority />
      </span>
      {!compact && (
        <span className="text-[1.35rem] font-bold leading-none text-[var(--foreground)]">
          Convora
        </span>
      )}
    </Link>
  );
}
