import { PDFDocument } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateImageUpload } from "@/processing/validation";

export const runtime = "nodejs";

const pageSizes = { A4: [595.28, 841.89], Letter: [612, 792] } as const;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);
    if (!files.length) return NextResponse.json({ error: "Add at least one image." }, { status: 400 });

    const pageSize = String(formData.get("pageSize") ?? "A4") as keyof typeof pageSizes | "Fit";
    const landscape = formData.get("orientation") === "landscape";
    const margin = Math.min(72, Math.max(0, Number(formData.get("margin") ?? 24)));
    const document = await PDFDocument.create();

    for (const file of files) {
      const upload = await validateImageUpload(file);
      const { data, info } = await sharp(upload.buffer).rotate().png().toBuffer({ resolveWithObject: true });
      const image = await document.embedPng(data);
      let dimensions: [number, number] = pageSize === "Fit"
        ? [Math.max(72, info.width * 0.75 + margin * 2), Math.max(72, info.height * 0.75 + margin * 2)]
        : [...pageSizes[pageSize in pageSizes ? pageSize as keyof typeof pageSizes : "A4"]];
      if (landscape && dimensions[1] > dimensions[0]) dimensions = [dimensions[1], dimensions[0]];
      if (!landscape && dimensions[0] > dimensions[1] && pageSize !== "Fit") dimensions = [dimensions[1], dimensions[0]];
      const page = document.addPage(dimensions);
      const availableWidth = dimensions[0] - margin * 2;
      const availableHeight = dimensions[1] - margin * 2;
      const scale = Math.min(availableWidth / image.width, availableHeight / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      page.drawImage(image, { x: (dimensions[0] - width) / 2, y: (dimensions[1] - height) / 2, width, height });
    }

    const output = await document.save();
    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=\"convora-images.pdf\"",
        "X-Convora-Filename": "convora-images.pdf",
        "X-Convora-Output-Size": String(output.length),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create PDF." }, { status: 400 });
  }
}
