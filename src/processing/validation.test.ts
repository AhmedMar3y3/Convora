import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { getFormatByExtension } from "@/formats/image-formats";
import { maxFileSize, validateImageUpload } from "@/processing/validation";

describe("image validation", () => {
  it("detects supported extensions", () => {
    expect(getFormatByExtension("photo.jpeg")).toBe("jpg");
    expect(getFormatByExtension("vector.svg")).toBe("svg");
    expect(getFormatByExtension("archive.zip")).toBeNull();
  });

  it("accepts a valid png upload", async () => {
    const buffer = await sharp({ create: { width: 8, height: 8, channels: 3, background: "white" } }).png().toBuffer();
    const file = new File([buffer], "sample.png", { type: "image/png" });
    const upload = await validateImageUpload(file);

    expect(upload.format).toBe("png");
    expect(upload.mime).toBe("image/png");
  });

  it("rejects oversized files", async () => {
    const file = new File([new Uint8Array(maxFileSize + 1)], "huge.png", { type: "image/png" });

    await expect(validateImageUpload(file)).rejects.toThrow("larger than 18 MB");
  });

  it("rejects unsupported content", async () => {
    const file = new File([new TextEncoder().encode("not an image")], "fake.png", { type: "image/png" });

    await expect(validateImageUpload(file)).rejects.toThrow("not a supported image");
  });
});
