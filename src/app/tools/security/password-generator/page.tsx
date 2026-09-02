import type { Metadata } from "next";
import { SecurityToolWorkspace } from "@/features/security/security-tool-workspace";
export const metadata: Metadata = { title: "Password Generator", description: "Generate strong cryptographically random passwords locally." };
export default function Page() { return <SecurityToolWorkspace kind="password" />; }
