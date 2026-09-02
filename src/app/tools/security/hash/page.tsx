import type { Metadata } from "next";
import { SecurityToolWorkspace } from "@/features/security/security-tool-workspace";
export const metadata: Metadata = { title: "File Hash & Checksum", description: "Generate and verify SHA file checksums locally." };
export default function Page() { return <SecurityToolWorkspace kind="hash" />; }
