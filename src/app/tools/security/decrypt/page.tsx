import type { Metadata } from "next";
import { SecurityToolWorkspace } from "@/features/security/security-tool-workspace";
export const metadata: Metadata = { title: "Decrypt File", description: "Decrypt files protected by Convora." };
export default function Page() { return <SecurityToolWorkspace kind="decrypt" />; }
