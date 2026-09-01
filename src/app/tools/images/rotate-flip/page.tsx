import type { Metadata } from "next";
import { ImageUtilityWorkspace } from "@/features/images/advanced-image-workspaces";
export const metadata: Metadata = { title: "Rotate and Flip Images", description: "Rotate and flip image batches while preserving formats." };
export default function Page() { return <ImageUtilityWorkspace mode="transform" />; }
