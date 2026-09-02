import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { audioFormats, audioFormatIds, audioExtension, type AudioFormatId } from "@/formats/audio-formats";
import { runFfmpeg, saveUpload, transcode, withAudioWorkspace } from "@/processing/audio-processor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const operation = String(data.get("operation") ?? "convert");
    const format = String(data.get("format") ?? "mp3") as AudioFormatId;
    const files = data.getAll("files").filter((value): value is File => value instanceof File);
    if (!audioFormatIds.includes(format)) return error("Unsupported output format.");
    if (!files.length) return error("Add at least one audio file.");
    if (files.some((file) => file.size > 100 * 1024 * 1024)) return error("Each audio file must be 100 MB or smaller.");
    if (files.some((file) => !audioExtension(file.name) && !file.type.startsWith("audio/"))) return error("One or more files are not supported audio.");
    if (operation !== "merge" && files.length !== 1) return error("This tool accepts one audio file at a time.");

    const bitrate = Math.min(320, Math.max(32, Number(data.get("bitrate") ?? 192)));
    const starts = parseNumbers(data.get("starts"));
    const ends = parseNumbers(data.get("ends"));
    const result = await withAudioWorkspace(async (directory) => {
      const inputs = await Promise.all(files.map((file, index) => saveUpload(file, directory, index)));
      const output = path.join(directory, `convora-output.${format}`);
      if (operation === "merge") {
        const normalized: string[] = [];
        for (let index = 0; index < inputs.length; index++) {
          const clip = path.join(directory, `clip-${index}.${format}`);
          await transcode(inputs[index], clip, format, bitrate, { start: starts[index] ?? 0, end: ends[index] || undefined });
          normalized.push(clip);
        }
        const args: string[] = [];
        normalized.forEach((input) => args.push("-i", input));
        args.push("-filter_complex", `${normalized.map((_, index) => `[${index}:a]`).join("")}concat=n=${normalized.length}:v=0:a=1[out]`, "-map", "[out]", "-c:a", audioFormats[format].codec);
        if (!["wav", "flac"].includes(format)) args.push("-b:a", `${bitrate}k`);
        args.push(output);
        await runFfmpeg(args);
        return (await import("node:fs/promises")).readFile(output);
      }
      const trim = operation === "trim" ? { start: starts[0] ?? 0, end: ends[0] || undefined } : undefined;
      return transcode(inputs[0], output, format, operation === "compress" || operation === "convert" ? bitrate : undefined, trim);
    });
    const filename = `convora-${operation}.${format}`;
    return new NextResponse(new Uint8Array(result), { headers: { "Content-Type": audioFormats[format].mime, "Content-Disposition": `attachment; filename="${filename}"`, "X-Convora-Filename": filename, "X-Convora-Original-Size": String(files.reduce((sum, file) => sum + file.size, 0)), "X-Convora-Output-Size": String(result.length) } });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : typeof caught === "string" ? caught : String(caught);
    console.error("Audio processing failed", caught);
    return error(message && message !== "[object Object]" ? message : "Unable to process audio.");
  }
}

function parseNumbers(value: FormDataEntryValue | null) {
  try { return JSON.parse(String(value ?? "[]")).map((item: unknown) => Math.max(0, Number(item) || 0)) as number[]; } catch { return []; }
}
function error(message: string) { return NextResponse.json({ error: message }, { status: 400 }); }
