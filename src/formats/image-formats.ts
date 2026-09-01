export const imageFormats = {
  jpg: { label: "JPG", mime: "image/jpeg", extensions: ["jpg", "jpeg"], sharpFormat: "jpeg" },
  png: { label: "PNG", mime: "image/png", extensions: ["png"], sharpFormat: "png" },
  webp: { label: "WebP", mime: "image/webp", extensions: ["webp"], sharpFormat: "webp" },
  avif: { label: "AVIF", mime: "image/avif", extensions: ["avif"], sharpFormat: "avif" },
  gif: { label: "GIF", mime: "image/gif", extensions: ["gif"], sharpFormat: "gif" },
  tiff: { label: "TIFF", mime: "image/tiff", extensions: ["tif", "tiff"], sharpFormat: "tiff" },
  bmp: { label: "BMP", mime: "image/bmp", extensions: ["bmp"], sharpFormat: "png" },
  svg: { label: "SVG", mime: "image/svg+xml", extensions: ["svg"], sharpFormat: "png" },
} as const;

export type ImageFormatId = keyof typeof imageFormats;

export const outputFormats = ["jpg", "png", "webp", "avif", "gif", "tiff", "bmp", "svg"] as const satisfies ImageFormatId[];

export const acceptedImageExtensions = Object.values(imageFormats).flatMap((format) => format.extensions);
export const acceptedImageMimes = Object.values(imageFormats).map((format) => format.mime);

export function getFormatByExtension(filename: string): ImageFormatId | null {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }

  const match = Object.entries(imageFormats).find(([, format]) => (format.extensions as readonly string[]).includes(extension));
  return match?.[0] as ImageFormatId | undefined ?? null;
}
