import { NextRequest, NextResponse } from "next/server";
import * as exifr from "exifr";
import sharp from "sharp";
import { validateImageUpload } from "@/processing/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);
    if (!files.length) return NextResponse.json({ error: "Add at least one image." }, { status: 400 });

    const reports = await Promise.all(files.map(async (file) => {
      const upload = await validateImageUpload(file);
      const [pixels, exif] = await Promise.all([
        sharp(upload.buffer).metadata(),
        exifr.parse(upload.buffer, { tiff: true, exif: true, gps: true }).catch(() => undefined),
      ]);
      return {
        filename: upload.filename,
        size: upload.size,
        technical: {
          format: pixels.format?.toUpperCase(),
          dimensions: pixels.width && pixels.height ? pixels.width + " × " + pixels.height : undefined,
          colorSpace: pixels.space,
          channels: pixels.channels,
          density: pixels.density ? pixels.density + " DPI" : undefined,
          orientation: pixels.orientation,
          pages: pixels.pages,
          alpha: pixels.hasAlpha ? "Yes" : "No",
        },
        camera: {
          make: exif?.Make,
          model: exif?.Model,
          lens: exif?.LensModel,
          captured: formatDate(exif?.DateTimeOriginal ?? exif?.CreateDate),
          exposure: exif?.ExposureTime,
          aperture: exif?.FNumber,
          iso: exif?.ISO,
          focalLength: exif?.FocalLength,
        },
        location: exif?.latitude != null && exif?.longitude != null ? { latitude: exif.latitude, longitude: exif.longitude } : undefined,
      };
    }));
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to read metadata." }, { status: 400 });
  }
}

function formatDate(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
