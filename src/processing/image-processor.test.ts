import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { outputFormats } from "@/formats/image-formats";
import { processImage } from "@/processing/image-processor";

describe("image processor", () => {
  it("supports the public output format registry", () => {
    expect(outputFormats).toEqual(["jpg", "png", "webp", "avif", "gif", "tiff", "bmp", "svg"]);
  });

  it("encodes BMP output", async () => {
    const input = await sharp({ create: { width: 16, height: 12, channels: 4, background: "#30d5c8" } }).png().toBuffer();
    const output = await processImage(input, "bmp");

    expect(output.subarray(0, 2).toString("ascii")).toBe("BM");
    expect(output.readInt32LE(18)).toBe(16);
    expect(output.readInt32LE(22)).toBe(12);
  });

  it("encodes valid SVG output", async () => {
    const input = await sharp({ create: { width: 16, height: 12, channels: 3, background: "#7562f8" } }).png().toBuffer();
    const output = await processImage(input, "svg");
    const markup = output.toString("utf8");

    expect(markup).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(markup).toContain('viewBox="0 0 16 12"');
    expect(markup).toContain("data:image/png;base64,");
  });

  it("encodes GIF output", async () => {
    const input = await sharp({ create: { width: 16, height: 12, channels: 3, background: "#d44f72" } }).png().toBuffer();
    const output = await processImage(input, "gif");

    expect(output.subarray(0, 3).toString("ascii")).toBe("GIF");
  });

  it("converts an image to webp", async () => {
    const input = await sharp({ create: { width: 64, height: 48, channels: 3, background: "#30d5c8" } }).png().toBuffer();
    const output = await processImage(input, "webp", { quality: 72 });
    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(64);
    expect(metadata.height).toBe(48);
  });

  it("resizes while preserving format", async () => {
    const input = await sharp({ create: { width: 120, height: 90, channels: 3, background: "#7562f8" } }).png().toBuffer();
    const output = await processImage(input, "png", { resize: { width: 60 } });
    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(60);
    expect(metadata.height).toBe(45);
  });

  it("takes the largest centered crop for the requested ratio", async () => {
    const input = await sharp({ create: { width: 100, height: 80, channels: 3, background: "#d44f72" } }).png().toBuffer();
    const output = await processImage(input, "jpg", { crop: { left: 0, top: 0, width: 16, height: 9, aspectRatio: 16 / 9, rotate: 0, flipX: false, flipY: false } });
    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(100);
    expect(metadata.height).toBe(56);
  });

  it("calculates crop dimensions after rotation", async () => {
    const input = await sharp({ create: { width: 120, height: 80, channels: 3, background: "#30d5c8" } }).png().toBuffer();
    const output = await processImage(input, "png", { crop: { left: 0, top: 0, width: 16, height: 9, aspectRatio: 16 / 9, rotate: 90, flipX: false, flipY: false } });
    const metadata = await sharp(output).metadata();

    expect(metadata.width).toBe(80);
    expect(metadata.height).toBe(45);
  });

  it("rotates and flips while preserving the requested format", async () => {
    const input = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#30d5c8" } }).png().toBuffer();
    const output = await processImage(input, "png", { transform: { rotate: 90, flipX: true } });
    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(40);
    expect(metadata.height).toBe(80);
  });

  it("composites a text watermark", async () => {
    const input = await sharp({ create: { width: 320, height: 180, channels: 3, background: "#10131a" } }).png().toBuffer();
    const output = await processImage(input, "png", { watermark: { kind: "text", text: "Convora", position: "center", opacity: 0.7, size: 12, rotate: -12 } });
    const inputStats = await sharp(input).stats();
    const outputStats = await sharp(output).stats();

    expect(outputStats.channels[0].mean).toBeGreaterThan(inputStats.channels[0].mean);
  }, 15_000);

  it("strips metadata unless metadata is explicitly retained", async () => {
    const input = await sharp({ create: { width: 40, height: 30, channels: 3, background: "#7562f8" } }).jpeg().withMetadata({ density: 300 }).toBuffer();
    const output = await processImage(input, "jpg");
    const metadata = await sharp(output).metadata();

    expect(metadata.density).not.toBe(300);
    expect(metadata.exif).toBeUndefined();
  });
});
