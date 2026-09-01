import sharp from "sharp";
import type { ImageFormatId } from "@/formats/image-formats";

export type ResizeOptions = {
  width?: number;
  height?: number;
  fit?: "inside" | "fill";
};

export type CropOptions = {
  left: number;
  top: number;
  width: number;
  height: number;
  aspectRatio?: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
};

export type TransformOptions = {
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
};

export type WatermarkOptions =
  | { kind: "text"; text: string; position: string; opacity: number; size: number; rotate: number }
  | { kind: "image"; input: Buffer; position: string; opacity: number; size: number; rotate: number };

export async function processImage(
  input: Buffer,
  outputFormat: ImageFormatId,
  options: { quality?: number; resize?: ResizeOptions; crop?: CropOptions; transform?: TransformOptions; watermark?: WatermarkOptions } = {},
) {
  let pipeline = sharp(input, { animated: outputFormat === "gif" }).rotate();

  if (options.transform) {
    if (options.transform.rotate) pipeline = pipeline.rotate(options.transform.rotate);
    if (options.transform.flipX) pipeline = pipeline.flop();
    if (options.transform.flipY) pipeline = pipeline.flip();
  }

  if (options.crop) {
    const { rotate, flipX, flipY } = options.crop;
    if (rotate) pipeline = pipeline.rotate(rotate);
    if (flipX) pipeline = pipeline.flop();
    if (flipY) pipeline = pipeline.flip();

    const transformed = await pipeline.toBuffer({ resolveWithObject: true });
    const sourceWidth = transformed.info.width;
    const sourceHeight = transformed.info.height;
    const ratio = options.crop.aspectRatio && options.crop.aspectRatio > 0
      ? options.crop.aspectRatio
      : Math.max(1, options.crop.width) / Math.max(1, options.crop.height);
    let cropWidth = sourceWidth;
    let cropHeight = Math.round(cropWidth / ratio);
    if (cropHeight > sourceHeight) {
      cropHeight = sourceHeight;
      cropWidth = Math.round(cropHeight * ratio);
    }
    const left = Math.max(0, Math.floor((sourceWidth - cropWidth) / 2));
    const top = Math.max(0, Math.floor((sourceHeight - cropHeight) / 2));
    pipeline = sharp(transformed.data).extract({ left, top, width: cropWidth, height: cropHeight });
  }

  if (options.resize) {
    pipeline = pipeline.resize({
      width: options.resize.width,
      height: options.resize.height,
      fit: options.resize.fit ?? "inside",
      withoutEnlargement: false,
    });
  }

  if (options.watermark) {
    const metadata = await pipeline.clone().metadata();
    const width = metadata.width ?? 1200;
    const height = metadata.height ?? 800;
    const watermark = options.watermark.kind === "text"
      ? createTextWatermark(options.watermark, width, height)
      : await createImageWatermark(options.watermark, width);
    pipeline = pipeline.composite([{ input: watermark, gravity: positionToGravity(options.watermark.position) }]);
  }

  const quality = options.quality ?? 82;

  switch (outputFormat) {
    case "jpg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ quality, compressionLevel: 9, palette: quality < 80 });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality });
      break;
    case "gif":
      pipeline = pipeline.gif({ effort: 7 });
      break;
    case "tiff":
      pipeline = pipeline.tiff({ quality });
      break;
    case "bmp": {
      const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      return encodeBmp(data, info.width, info.height);
    }
    case "svg": {
      const { data, info } = await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });
      return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}" viewBox="0 0 ${info.width} ${info.height}"><image width="${info.width}" height="${info.height}" href="data:image/png;base64,${data.toString("base64")}"/></svg>`,
      );
    }
  }

  return pipeline.toBuffer();
}

function createTextWatermark(options: Extract<WatermarkOptions, { kind: "text" }>, width: number, height: number) {
  const padding = Math.max(18, Math.round(Math.min(width, height) * 0.05));
  const fontSize = Math.max(16, Math.round(width * options.size / 100));
  const horizontal = options.position.endsWith("left") ? { x: padding, anchor: "start" } : options.position.endsWith("right") ? { x: width - padding, anchor: "end" } : { x: width / 2, anchor: "middle" };
  const y = options.position.startsWith("top") ? padding + fontSize : options.position.startsWith("bottom") ? height - padding : height / 2;
  const baseline = options.position.startsWith("center") || options.position === "center" ? "middle" : "auto";
  const text = escapeXml(options.text);
  const svg = '<svg width="' + width + '" height="' + height + '" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(' + options.rotate + ' ' + width / 2 + ' ' + height / 2 + ')"><text x="' + horizontal.x + '" y="' + y + '" text-anchor="' + horizontal.anchor + '" dominant-baseline="' + baseline + '" font-family="Arial, sans-serif" font-weight="700" font-size="' + fontSize + '" fill="white" fill-opacity="' + options.opacity + '" stroke="black" stroke-opacity="' + options.opacity * 0.35 + '" stroke-width="' + Math.max(1, fontSize * 0.025) + '">' + text + '</text></g></svg>';
  return Buffer.from(svg);
}

async function createImageWatermark(options: Extract<WatermarkOptions, { kind: "image" }>, sourceWidth: number) {
  const targetWidth = Math.max(24, Math.round(sourceWidth * options.size / 100));
  const { data, info } = await sharp(options.input).resize({ width: targetWidth, withoutEnlargement: false }).rotate(options.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 3; index < data.length; index += 4) data[index] = Math.round(data[index] * options.opacity);
  return sharp(data, { raw: info }).png().toBuffer();
}

function positionToGravity(position: string) {
  const positions: Record<string, string> = {
    "top-left": "northwest", "top-center": "north", "top-right": "northeast",
    "center-left": "west", center: "center", "center-right": "east",
    "bottom-left": "southwest", "bottom-center": "south", "bottom-right": "southeast",
  };
  return positions[position] ?? "southeast";
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
}

function encodeBmp(rgba: Buffer, width: number, height: number) {
  const headerSize = 54;
  const rowSize = width * 4;
  const pixelSize = rowSize * height;
  const output = Buffer.alloc(headerSize + pixelSize);

  output.write("BM", 0, "ascii");
  output.writeUInt32LE(output.length, 2);
  output.writeUInt32LE(headerSize, 10);
  output.writeUInt32LE(40, 14);
  output.writeInt32LE(width, 18);
  output.writeInt32LE(height, 22);
  output.writeUInt16LE(1, 26);
  output.writeUInt16LE(32, 28);
  output.writeUInt32LE(pixelSize, 34);
  output.writeInt32LE(2835, 38);
  output.writeInt32LE(2835, 42);

  for (let y = 0; y < height; y += 1) {
    const sourceRow = y * rowSize;
    const targetRow = headerSize + (height - y - 1) * rowSize;
    for (let x = 0; x < width; x += 1) {
      const source = sourceRow + x * 4;
      const target = targetRow + x * 4;
      output[target] = rgba[source + 2];
      output[target + 1] = rgba[source + 1];
      output[target + 2] = rgba[source];
      output[target + 3] = rgba[source + 3];
    }
  }

  return output;
}
