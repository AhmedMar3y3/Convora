import type { Metadata } from "next";
import { ImageToolWorkspace } from "@/features/images/image-tool-workspace";

export const metadata: Metadata = {
  title: "Image Converter",
  description: "Convert JPG, PNG, WebP, AVIF, GIF, TIFF, BMP, and SVG images privately with Convora.",
  alternates: { canonical: "/tools/images/convert" },
  openGraph: { title: "Image Converter | Convora", description: "Batch image conversion with drag-and-drop uploads and runtime processing.", url: "/tools/images/convert" },
};

export default function Page() {
  return <ImageToolWorkspace toolId="image-converter" />;
}
