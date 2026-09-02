import type { Metadata } from "next";
import { SecurityToolWorkspace } from "@/features/security/security-tool-workspace";
export const metadata: Metadata = { title: "Encrypt File", description: "Password-encrypt any file locally with AES-256-GCM." };
export default function Page() { return <SecurityToolWorkspace kind="encrypt" />; }
