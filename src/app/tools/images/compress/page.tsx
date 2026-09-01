import type { Metadata } from "next";
import { ImageToolWorkspace } from "@/features/images/image-tool-workspace";

export const metadata: Metadata = {
  title: "Image Compressor",
  description: "Compress images privately and compare real original and output sizes.",
  alternates: { canonical: "/tools/images/compress" },
  openGraph: { title: "Image Compressor | Convora", description: "Runtime image compression with real file-size savings.", url: "/tools/images/compress" },
};

export default function Page() {
  return <ImageToolWorkspace toolId="image-compressor" />;
}
