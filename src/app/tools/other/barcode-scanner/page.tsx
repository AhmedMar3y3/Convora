import type { Metadata } from "next";
import { CodeScanner } from "@/features/other/code-tools";
export const metadata: Metadata = { title: "Barcode Scanner", description: "Decode common barcode formats from uploaded images." };
export default function Page() { return <CodeScanner kind="barcode" />; }
