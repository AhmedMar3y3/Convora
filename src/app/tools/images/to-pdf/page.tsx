import type { Metadata } from "next";
import { ImageToPdfWorkspace } from "@/features/images/advanced-image-workspaces";
export const metadata: Metadata = { title: "Image to PDF", description: "Order images and create a private multipage PDF with Convora." };
export default function Page() { return <ImageToPdfWorkspace />; }
