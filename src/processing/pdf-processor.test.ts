import { describe, expect, it } from "vitest";
import { isPdfBytes, parsePageRanges, rangePages } from "./pdf-processor";

describe("PDF processing helpers", () => {
  it("validates the PDF signature", () => {
    expect(isPdfBytes(new Uint8Array([37, 80, 68, 70, 45]))).toBe(true);
    expect(isPdfBytes(new Uint8Array([80, 68, 70]))).toBe(false);
  });
  it("parses and normalizes page ranges", () => {
    expect(parsePageRanges("1-3, 7, 10-12", 12)).toEqual([{ from: 1, to: 3 }, { from: 7, to: 7 }, { from: 10, to: 12 }]);
    expect(rangePages(parsePageRanges("3, 1-2, 2", 3))).toEqual([0, 1, 2]);
  });
  it("rejects out-of-bounds and inverted ranges", () => {
    expect(() => parsePageRanges("0-2", 5)).toThrow();
    expect(() => parsePageRanges("4-2", 5)).toThrow();
    expect(() => parsePageRanges("6", 5)).toThrow();
  });
});
