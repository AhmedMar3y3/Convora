import type { Metadata } from "next";
import { ImageUtilityWorkspace } from "@/features/images/advanced-image-workspaces";
export const metadata: Metadata = { title: "Remove Image Metadata", description: "Inspect and strip EXIF and private metadata from images." };
export default function Page() { return <ImageUtilityWorkspace mode="strip" />; }
