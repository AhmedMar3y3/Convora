import type { Metadata } from "next";
import { ImageUtilityWorkspace } from "@/features/images/advanced-image-workspaces";
export const metadata: Metadata = { title: "Watermark Image", description: "Apply text or logo watermarks to image batches privately." };
export default function Page() { return <ImageUtilityWorkspace mode="watermark" />; }
