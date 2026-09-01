import { fileTypeFromBuffer } from "file-type";
import { acceptedImageExtensions, acceptedImageMimes, getFormatByExtension, imageFormats, type ImageFormatId } from "@/formats/image-formats";

export const maxFileSize = 18 * 1024 * 1024;

export type ValidatedUpload = {
  buffer: Buffer;
  filename: string;
  format: ImageFormatId;
  mime: string;
  size: number;
};

export async function validateImageUpload(file: File): Promise<ValidatedUpload> {
  if (file.size > maxFileSize) {
    throw new Error(`${file.name} is larger than 18 MB.`);
  }

  const extensionFormat = getFormatByExtension(file.name);
  if (!extensionFormat) {
    throw new Error(`${file.name} uses an unsupported extension. Supported: ${acceptedImageExtensions.join(", ")}.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  const isSvg = buffer.subarray(0, 512).toString("utf8").toLowerCase().includes("<svg");
  const mime = isSvg ? "image/svg+xml" : detected?.mime;

  if (!mime || !(acceptedImageMimes as readonly string[]).includes(mime)) {
    throw new Error(`${file.name} is not a supported image file.`);
  }

  if (imageFormats[extensionFormat].mime !== mime) {
    throw new Error(`${file.name} contents do not match its file extension.`);
  }

  return { buffer, filename: file.name, format: extensionFormat, mime, size: file.size };
}
