import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const run = promisify(execFile);

export async function POST(request: NextRequest) {
  if (process.platform !== "win32") return NextResponse.json({ error: "Native Microsoft Word conversion is unavailable on this server." }, { status: 501 });
  const directory = await mkdtemp(path.join(tmpdir(), "convora-word-"));
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose one DOCX file." }, { status: 400 });
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "The DOCX must be 50 MB or smaller." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) return NextResponse.json({ error: "The selected file is not a valid DOCX document." }, { status: 400 });
    const input = path.join(directory, "input.docx");
    const output = path.join(directory, "output.pdf");
    await writeFile(input, bytes);
    await run("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", path.join(process.cwd(), "scripts", "word-to-pdf.ps1"), "-InputPath", input, "-OutputPath", output], { windowsHide: true, timeout: 55_000 });
    const pdf = await readFile(output);
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${safeStem(file.name)}.pdf"`, "Cache-Control": "no-store", "X-Convora-Engine": "Microsoft-Word" } });
  } catch (caught) {
    console.error("Native Word conversion failed", caught);
    return NextResponse.json({ error: "Microsoft Word could not convert this document. The private browser fallback is still available." }, { status: 500 });
  } finally {
    await rm(directory, { recursive: true, force: true }).catch(() => undefined);
  }
}

function safeStem(name: string) { return name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100) || "document"; }
