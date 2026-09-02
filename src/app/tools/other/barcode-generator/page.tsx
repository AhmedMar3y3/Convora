import type { Metadata } from "next";
import { BarcodeGenerator } from "@/features/other/code-tools";
export const metadata: Metadata = { title: "Barcode Generator", description: "Create common barcode formats and download PNG or SVG files." };
export default function Page() { return <BarcodeGenerator />; }
