import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "button-primary shadow-[var(--shadow)] hover:brightness-105 hover:scale-[1.02]",
  secondary: "liquid-glass liquid-glass-interactive text-[var(--foreground)] hover:bg-[var(--accent-soft)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--accent-soft)] hover:backdrop-blur-xl",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45", variants[variant], className)}
      {...props}
    />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
};

export function LinkButton({ className, variant = "primary", href, children, ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition", variants[variant], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
