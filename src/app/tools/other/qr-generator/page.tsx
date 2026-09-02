import type { Metadata } from "next";
import { QrGenerator } from "@/features/other/code-tools";
export const metadata: Metadata = { title: "QR Code Generator", description: "Create customizable QR codes and download PNG or SVG files." };
export default function Page() { return <QrGenerator />; }
