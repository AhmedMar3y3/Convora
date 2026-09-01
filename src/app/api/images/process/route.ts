import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { imageFormats, outputFormats, type ImageFormatId } from "@/formats/image-formats";
import { safeOutputName } from "@/lib/utils";
import { processImage } from "@/processing/image-processor";
import { validateImageUpload } from "@/processing/validation";

export const runtime = "nodejs";

type Operation = "convert" | "compress" | "resize" | "crop";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const operation = String(formData.get("operation") ?? "convert") as Operation;
    const outputFormat = String(formData.get("outputFormat") ?? "webp") as ImageFormatId;
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (!outputFormats.includes(outputFormat as (typeof outputFormats)[number])) {
      return jsonError("Unsupported output format.", 400);
    }

    if (files.length === 0) {
      return jsonError("Add at least one image.", 400);
    }

    const quality = clampNumber(Number(formData.get("quality") ?? 82), 1, 100);
    const width = optionalPositive(formData.get("width"));
    const height = optionalPositive(formData.get("height"));
    const cropPayload = parseCrop(formData.get("crop"));
    const processed = [];

    for (const file of files) {
      const upload = await validateImageUpload(file);
      const targetFormat = operation === "compress" ? upload.format : outputFormat;
      const buffer = await processImage(upload.buffer, targetFormat, {
        quality,
        resize: operation === "resize" ? { width, height } : undefined,
        crop: operation === "crop" ? cropPayload : undefined,
      });
      const filename = safeOutputName(upload.filename, targetFormat === "jpg" ? "jpg" : targetFormat);
      processed.push({ buffer, filename, mime: imageFormats[targetFormat].mime, originalSize: upload.size });
    }

    if (processed.length === 1) {
      const file = processed[0];
      return new NextResponse(new Uint8Array(file.buffer), {
        headers: {
          "Content-Type": file.mime,
          "Content-Disposition": `attachment; filename="${file.filename}"`,
          "X-Convora-Filename": encodeURIComponent(file.filename),
          "X-Convora-Original-Size": String(file.originalSize),
          "X-Convora-Output-Size": String(file.buffer.length),
        },
      });
    }

    const zip = new JSZip();
    for (const file of processed) {
      zip.file(file.filename, file.buffer);
    }
    const bundle = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(new Uint8Array(bundle), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=\"convora-images.zip\"",
        "X-Convora-Filename": "convora-images.zip",
        "X-Convora-Output-Size": String(bundle.length),
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to process images.", 400);
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(max, Math.max(min, value));
}

function optionalPositive(value: FormDataEntryValue | null) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : undefined;
}

function parseCrop(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = JSON.parse(value) as {
    left: number;
    top: number;
    width: number;
    height: number;
    rotate?: number;
    flipX?: boolean;
    flipY?: boolean;
    aspectRatio?: number;
  };

  return {
    left: parsed.left,
    top: parsed.top,
    width: parsed.width,
    height: parsed.height,
    rotate: parsed.rotate ?? 0,
    flipX: parsed.flipX ?? false,
    flipY: parsed.flipY ?? false,
    aspectRatio: parsed.aspectRatio,
  };
}
