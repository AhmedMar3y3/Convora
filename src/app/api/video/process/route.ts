import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { audioFormatIds, audioFormats, type AudioFormatId } from "@/formats/audio-formats";
import { videoExtension, videoFormatIds, videoFormats, type VideoFormatId } from "@/formats/video-formats";
import { extractAudio, processVideo, saveUpload, withVideoWorkspace } from "@/processing/video-processor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData(); const file = data.get("file");
    if (!(file instanceof File)) return error("Add a video file.");
    if (file.size > 500 * 1024 * 1024) return error("Video must be 500 MB or smaller.");
    if (!videoExtension(file.name) && !file.type.startsWith("video/")) return error("This video format is not supported.");
    const operation = String(data.get("operation") ?? "convert");
    const result = await withVideoWorkspace(async (directory) => {
      const input = await saveUpload(file, directory);
      if (operation === "audio") {
        const format = String(data.get("audioFormat") ?? "mp3") as AudioFormatId;
        if (!audioFormatIds.includes(format)) throw new Error("Unsupported audio format.");
        const output = path.join(directory, `convora-output.${format}`);
        return { bytes: await extractAudio(input, output, format), format, mime: audioFormats[format].mime };
      }
      const format = String(data.get("format") ?? "mp4") as VideoFormatId;
      if (!videoFormatIds.includes(format)) throw new Error("Unsupported video format.");
      const quality = (["small", "balanced", "high"].includes(String(data.get("quality"))) ? String(data.get("quality")) : "balanced") as "small" | "balanced" | "high";
      const resolution = ["original", "1080", "720", "480"].includes(String(data.get("resolution"))) ? String(data.get("resolution")) : "original";
      const fps = [0, 24, 30, 60].includes(Number(data.get("fps"))) ? Number(data.get("fps")) : 0;
      const start = Math.max(0, Number(data.get("start")) || 0); const end = Math.max(0, Number(data.get("end")) || 0);
      const output = path.join(directory, `convora-output.${format}`);
      return { bytes: await processVideo(input, output, { format, quality, resolution, fps, start: operation === "trim" ? start : undefined, end: operation === "trim" ? end : undefined }), format, mime: videoFormats[format].mime };
    });
    const filename = `convora-${operation}.${result.format}`;
    return new NextResponse(new Uint8Array(result.bytes), { headers: { "Content-Type": result.mime, "Content-Disposition": `attachment; filename="${filename}"`, "X-Convora-Filename": filename, "X-Convora-Original-Size": String(file.size) } });
  } catch (caught) { console.error("Video processing failed", caught); return error(caught instanceof Error ? caught.message : "Unable to process video."); }
}
function error(message: string) { return NextResponse.json({ error: message }, { status: 400 }); }
