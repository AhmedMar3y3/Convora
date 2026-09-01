import type { Metadata } from "next";
import { ImageUtilityWorkspace } from "@/features/images/advanced-image-workspaces";
export const metadata: Metadata = { title: "Image Metadata Viewer", description: "Inspect camera, date, GPS, dimensions, and technical image metadata." };
export default function Page() { return <ImageUtilityWorkspace mode="metadata" />; }
