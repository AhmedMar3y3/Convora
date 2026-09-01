import type { Metadata } from "next";
import { ImageToolWorkspace } from "@/features/images/image-tool-workspace";

export const metadata: Metadata = {
  title: "Image Resizer",
  description: "Resize one image or a batch with width, height, and output format controls.",
  alternates: { canonical: "/tools/images/resize" },
  openGraph: { title: "Image Resizer | Convora", description: "Batch image resizing with runtime processing.", url: "/tools/images/resize" },
};

export default function Page() {
  return <ImageToolWorkspace toolId="image-resizer" />;
}
