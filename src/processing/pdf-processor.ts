import { PDFDocument, degrees } from "pdf-lib";

export type PageRange = { from: number; to: number };
export type PdfPagePlan = { sourceIndex: number; rotation: number };
export type CompressionLevel = "recommended" | "maximum" | "quality";

const PDF_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d];

export function isPdfBytes(bytes: Uint8Array) {
  return PDF_HEADER.every((value, index) => bytes[index] === value);
}

export async function loadPdf(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdfBytes(bytes)) throw new Error("This file is not a valid PDF.");
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("encrypt")) throw new Error("Password-protected PDFs are not supported. Unlock the file and try again.");
    throw new Error("This PDF is malformed or unsupported.");
  }
}

export function parsePageRanges(value: string, pageCount: number): PageRange[] {
  if (!value.trim()) throw new Error("Enter at least one page or range.");
  const ranges = value.split(",").map((part) => {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error(`“${part.trim()}” is not a valid page range.`);
    const from = Number(match[1]);
    const to = Number(match[2] ?? match[1]);
    if (from < 1 || to < from || to > pageCount) throw new Error(`Pages must be between 1 and ${pageCount}.`);
    return { from, to };
  });
  return ranges;
}

export function rangePages(ranges: PageRange[]) {
  const values = new Set<number>();
  ranges.forEach(({ from, to }) => { for (let page = from; page <= to; page++) values.add(page - 1); });
  return [...values].sort((a, b) => a - b);
}

export async function mergePdfs(files: File[]) {
  const output = await PDFDocument.create();
  for (const file of files) {
    const source = await loadPdf(file);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return output.save({ useObjectStreams: true });
}

export async function createPdfFromPages(file: File, indices: number[]) {
  const source = await loadPdf(file);
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function organizePdf(file: File, plan: PdfPagePlan[]) {
  const source = await loadPdf(file);
  const output = await PDFDocument.create();
  for (const item of plan) {
    const [page] = await output.copyPages(source, [item.sourceIndex]);
    const current = page.getRotation().angle;
    page.setRotation(degrees(((current + item.rotation) % 360 + 360) % 360));
    output.addPage(page);
  }
  return output.save({ useObjectStreams: true });
}

export async function compressPdf(file: File, level: CompressionLevel) {
  const source = await loadPdf(file);
  if (level === "maximum") {
    source.setTitle(""); source.setAuthor(""); source.setSubject(""); source.setKeywords([]); source.setProducer(""); source.setCreator("");
  }
  const bytes = await source.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: level === "quality" ? 20 : 100 });
  return bytes.length < file.size ? bytes : new Uint8Array(await file.arrayBuffer());
}
