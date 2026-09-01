import type { Metadata } from "next";
import { ImageToolWorkspace } from "@/features/images/image-tool-workspace";

export const metadata: Metadata = {
  title: "Image Cropper",
  description: "Crop, rotate, and flip images privately with Convora.",
  alternates: { canonical: "/tools/images/crop" },
  openGraph: { title: "Image Cropper | Convora", description: "A polished runtime image cropper for common aspect ratios.", url: "/tools/images/crop" },
};

export default function Page() {
  return <ImageToolWorkspace toolId="image-cropper" />;
}
