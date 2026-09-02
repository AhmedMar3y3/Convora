import type { Metadata } from "next";
import { CodeScanner } from "@/features/other/code-tools";
export const metadata: Metadata = { title: "QR Code Scanner", description: "Decode QR codes from uploaded images in your browser." };
export default function Page() { return <CodeScanner kind="qr" />; }
