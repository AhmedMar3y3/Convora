import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ExternalLink, Heart } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://convora.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Convora - Every file, one beautiful workspace",
    template: "%s | Convora",
  },
  description: "Convora is a private file tools platform for converting, compressing, editing, and transforming every kind of file.",
  applicationName: "Convora",
  openGraph: {
    title: "Convora - Every file, one beautiful workspace",
    description: "Private, polished tools for images, documents, audio, video, archives, and more.",
    url: siteUrl,
    siteName: "Convora",
    images: [{ url: "/convora-mark-light.png", width: 1254, height: 1254, alt: "Convora file transformation mark" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Convora - Every file, one beautiful workspace",
    description: "Convert, compress, edit, and transform files without permanent storage.",
    images: ["/convora-mark-light.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/convora-mark-light.png", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/convora-mark-dark.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#080a0f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.classList.toggle('dark',localStorage.theme==='dark'||(!localStorage.theme&&matchMedia('(prefers-color-scheme: dark)').matches))}catch(e){}`,
          }}
        />
        <div className="page-shell">
          <header className="sticky top-4 z-50 mx-auto flex w-[min(1120px,calc(100%-2rem))] items-center justify-between rounded-full px-4 py-3 glass">
            <Brand />
            <nav className="hidden items-center gap-5 text-sm font-medium text-muted md:flex" aria-label="Primary navigation">
              <Link href="/">Home</Link>
              <Link href="/tools/images">Image</Link>
              <Link href="/tools/audio">Audio</Link>
              <Link href="/tools/documents">Docs</Link>
              <Link href="/tools/pdf">PDF</Link>
              <Link href="/tools/video">Video</Link>
              <Link href="/tools/data">Data</Link>
              <Link href="/tools/security">Security</Link>
              <Link href="/tools/other">Other</Link>
            </nav>
            <ThemeToggle />
          </header>
          <aside className="mx-auto mt-7 flex w-[min(1120px,calc(100%-2rem))] flex-col items-center justify-center gap-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-sm text-muted sm:flex-row" aria-label="Support Gaza relief">
            <span className="inline-flex items-center gap-2"><Heart size={15} className="text-[var(--rose)]" aria-hidden /> Convora is free, private, and ad-free.</span>
            <a href="https://www.pcrf.net/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[var(--foreground)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:text-[var(--accent-strong)]">
              Help support Gaza relief <ExternalLink size={13} aria-hidden />
            </a>
          </aside>
          {children}
        </div>
      </body>
    </html>
  );
}
