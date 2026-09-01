import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { imageFormats, type ImageFormatId } from "@/formats/image-formats";
import { safeOutputName } from "@/lib/utils";
import { processImage, type WatermarkOptions } from "@/processing/image-processor";
import { validateImageUpload } from "@/processing/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const operation = String(formData.get("operation") ?? "transform");
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);
    if (!files.length) return NextResponse.json({ error: "Add at least one image." }, { status: 400 });

    let watermark: WatermarkOptions | undefined;
    if (operation === "watermark") {
      const kind = formData.get("watermarkKind") === "image" ? "image" : "text";
      const shared = {
        position: String(formData.get("position") ?? "bottom-right"),
        opacity: clamp(Number(formData.get("opacity") ?? 0.6), 0.05, 1),
        size: clamp(Number(formData.get("size") ?? 12), 2, 60),
        rotate: clamp(Number(formData.get("watermarkRotate") ?? 0), -180, 180),
      };
      if (kind === "image") {
        const logo = formData.get("watermarkFile");
        if (!(logo instanceof File)) return NextResponse.json({ error: "Choose a watermark image." }, { status: 400 });
        watermark = { kind, input: (await validateImageUpload(logo)).buffer, ...shared };
      } else {
        const text = String(formData.get("watermarkText") ?? "").trim();
        if (!text) return NextResponse.json({ error: "Enter watermark text." }, { status: 400 });
        watermark = { kind, text: text.slice(0, 120), ...shared };
      }
    }

    const processed = [];
    for (const file of files) {
      const upload = await validateImageUpload(file);
      const targetFormat = upload.format as ImageFormatId;
      const buffer = await processImage(upload.buffer, targetFormat, {
        quality: 92,
        transform: operation === "transform" ? {
          rotate: Number(formData.get("rotate") ?? 0),
          flipX: formData.get("flipX") === "true",
          flipY: formData.get("flipY") === "true",
        } : undefined,
        watermark,
      });
      const suffix = operation === "strip" ? "clean" : operation === "watermark" ? "watermarked" : "transformed";
      const base = safeOutputName(upload.filename, targetFormat === "jpg" ? "jpg" : targetFormat).replace(/(\.[^.]+)$/, "-" + suffix + "$1");
      processed.push({ buffer, filename: base, mime: imageFormats[targetFormat].mime });
    }

    if (processed.length === 1) {
      const output = processed[0];
      return new NextResponse(new Uint8Array(output.buffer), { headers: {
        "Content-Type": output.mime,
        "Content-Disposition": 'attachment; filename="' + output.filename + '"',
        "X-Convora-Filename": encodeURIComponent(output.filename),
        "X-Convora-Output-Size": String(output.buffer.length),
      } });
    }
    const zip = new JSZip();
    processed.forEach((file) => zip.file(file.filename, file.buffer));
    const output = await zip.generateAsync({ type: "nodebuffer" });
    return new NextResponse(new Uint8Array(output), { headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=\"convora-images.zip\"",
      "X-Convora-Filename": "convora-images.zip",
      "X-Convora-Output-Size": String(output.length),
    } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process images." }, { status: 400 });
  }
}

function clamp(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}
