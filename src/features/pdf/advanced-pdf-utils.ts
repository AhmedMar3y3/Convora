export type PageOptions = { format: "a4" | "letter"; orientation: "portrait" | "landscape"; margin: number };
export type PdfOverlay = { page: number; kind: "text" | "rect" | "line" | "image"; x: number; y: number; width?: number; height?: number; text?: string; size?: number; color?: string; dataUrl?: string };

export function fileStem(name: string) { return name.replace(/\.[^.]+$/, ""); }
export function downloadBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function pdfBlob(bytes: Uint8Array) { return new Blob([bytes as BlobPart], { type: "application/pdf" }); }
export async function assertSignature(file: File, kind: "pdf" | "zip") { const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer()); const valid = kind === "pdf" ? String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-" : bytes[0] === 0x50 && bytes[1] === 0x4b; if (!valid) throw new Error(`The selected file is not a valid ${kind === "pdf" ? "PDF" : "Office Open XML"} document.`); }

export function sanitizeHtml(raw: string) {
  if (typeof DOMParser === "undefined") return raw;
  const documentNode = new DOMParser().parseFromString(raw, "text/html");
  documentNode.querySelectorAll("script,iframe,object,embed,form,link[rel='import']").forEach((node) => node.remove());
  documentNode.querySelectorAll("*").forEach((node) => Array.from(node.attributes).forEach((attribute) => { const name = attribute.name.toLowerCase(); const value = attribute.value.trim().toLowerCase(); if (name.startsWith("on") || ((name === "src" || name === "href") && /^(javascript:|https?:|\/\/)/.test(value))) node.removeAttribute(attribute.name); }));
  return documentNode.body.innerHTML;
}

export async function htmlToPdf(element: HTMLElement, options: PageOptions, exactPreview = false) {
  const [{ jsPDF }, html2canvas] = await Promise.all([import("jspdf"), import("html2canvas")]);
  const captureWidth = exactPreview ? element.clientWidth : undefined;
  const captureHeight = exactPreview ? element.scrollHeight : undefined;
  const canvas = await html2canvas.default(element, { scale: 1.6, useCORS: false, logging: false, foreignObjectRendering: false, imageTimeout: 15_000, backgroundColor: "#ffffff", width: captureWidth, height: captureHeight, windowWidth: captureWidth, windowHeight: captureHeight, scrollX: 0, scrollY: 0, onclone: (clonedDocument, cloned) => {
    clonedDocument.documentElement.style.background = "rgb(255, 255, 255)";
    clonedDocument.documentElement.style.color = "rgb(17, 24, 39)";
    clonedDocument.body.style.background = "rgb(255, 255, 255)";
    clonedDocument.body.style.color = "rgb(17, 24, 39)";
    cloned.style.borderColor = "rgb(209, 213, 219)";
    cloned.style.backgroundColor = "rgb(255, 255, 255)";
    cloned.style.color = "rgb(17, 24, 39)";
    if (exactPreview && captureWidth && captureHeight) {
      cloned.style.width = `${captureWidth}px`;
      cloned.style.height = `${captureHeight}px`;
      cloned.style.maxHeight = "none";
      cloned.style.overflow = "visible";
    }
    [clonedDocument.documentElement, clonedDocument.body, cloned, ...cloned.querySelectorAll<HTMLElement>("*")].forEach((node) => {
      const style = node.style;
      const computed = clonedDocument.defaultView?.getComputedStyle(node);
      for (const property of ["color", "backgroundColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor", "textDecorationColor"] as const) {
        const value = computed?.[property] || style[property];
        if (value) style[property] = normalizeCanvasColor(value);
      }
      if ((computed?.boxShadow ?? "").includes("oklch")) style.boxShadow = "none";
      if ((computed?.textShadow ?? "").includes("oklch")) style.textShadow = "none";
    });
  } });
  if (exactPreview) {
    const width = canvas.width / 1.6 * .75;
    const height = canvas.height / 1.6 * .75;
    const pdf = new jsPDF({ unit: "pt", format: [width, height], orientation: width > height ? "landscape" : "portrait", compress: true });
    pdf.addImage(canvas, "PNG", 0, 0, width, height, undefined, "FAST");
    canvas.width = 0; canvas.height = 0;
    return pdf.output("blob");
  }
  const pdf = new jsPDF({ unit: "pt", format: options.format, orientation: options.orientation });
  const pageWidth = pdf.internal.pageSize.getWidth(), pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - options.margin * 2, usableHeight = pageHeight - options.margin * 2;
  const renderedHeight = canvas.height * usableWidth / canvas.width;
  for (let offset = 0, page = 0; offset < renderedHeight; offset += usableHeight, page++) { if (page) pdf.addPage(); pdf.addImage(canvas, "PNG", options.margin, options.margin - offset, usableWidth, renderedHeight, undefined, "FAST"); }
  return pdf.output("blob");
}

function normalizeCanvasColor(value: string) {
  if (!value.includes("oklch") && !value.includes("oklab") && !value.includes("color(")) return value;
  const canvas = document.createElement("canvas");
  canvas.width = 1; canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "rgb(31, 41, 55)";
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
}

export async function docxElementToPdf(element: HTMLElement) {
  const [{ jsPDF }, html2canvas] = await Promise.all([import("jspdf"), import("html2canvas")]);
  await document.fonts?.ready;
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(images.map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined)));
  const pages = Array.from(element.querySelectorAll<HTMLElement>("section.docx"));
  if (!pages.length) throw new Error("The document did not contain any renderable pages.");
  let pdf: InstanceType<typeof jsPDF> | null = null;
  for (const page of pages) {
    const canvas = await html2canvas.default(page, { scale: 2, useCORS: false, logging: false, backgroundColor: "#ffffff" });
    const width = page.getBoundingClientRect().width * .75;
    const height = page.getBoundingClientRect().height * .75;
    if (!pdf) pdf = new jsPDF({ unit: "pt", format: [width, height], orientation: width > height ? "landscape" : "portrait", compress: true });
    else pdf.addPage([width, height], width > height ? "landscape" : "portrait");
    pdf.addImage(canvas, "PNG", 0, 0, width, height, undefined, "FAST");
    canvas.width = 0; canvas.height = 0;
  }
  return pdf!.output("blob");
}

export async function pptxSummary(file: File) {
  await assertSignature(file, "zip"); const { default: JSZip } = await import("jszip"); const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const presentation = await zip.file("ppt/presentation.xml")?.async("string"); if (!presentation) throw new Error("This PPTX is corrupted or unsupported.");
  const size = presentation.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/); const width = Number(size?.[1] ?? 12192000), height = Number(size?.[2] ?? 6858000);
  const paths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path)).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
  const slides = await Promise.all(paths.map(async (path) => { const xml = await zip.file(path)!.async("string"); const doc = new DOMParser().parseFromString(xml, "application/xml"); return Array.from(doc.getElementsByTagName("a:p")).map((paragraph) => Array.from(paragraph.getElementsByTagName("a:t")).map((node) => node.textContent ?? "").join("").trim()).filter(Boolean); }));
  return { slides, width, height };
}

export async function pptxToPdf(file: File) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib"); const { slides, width, height } = await pptxSummary(file); const landscape = width >= height; const pdf = await PDFDocument.create(); const font = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = landscape ? 960 : 540, pageHeight = pageWidth * height / width;
  slides.forEach((lines, index) => { const page = pdf.addPage([pageWidth, pageHeight]); page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) }); let y = pageHeight - 54; lines.forEach((line, lineIndex) => { const size = lineIndex === 0 ? 25 : 15; const used = lineIndex === 0 ? bold : font; const maxChars = Math.max(24, Math.floor((pageWidth - 96) / (size * .5))); const words = line.split(/\s+/); const wrapped: string[] = []; let current = ""; for (const word of words) { if (`${current} ${word}`.trim().length > maxChars && current) { wrapped.push(current); current = word; } else current = `${current} ${word}`.trim(); } if (current) wrapped.push(current); wrapped.forEach((part) => { if (y > 42) page.drawText(part, { x: 48, y, size, font: used, color: rgb(.1, .12, .16), maxWidth: pageWidth - 96 }); y -= size * 1.45; }); y -= lineIndex === 0 ? 12 : 5; }); page.drawText(`${index + 1}`, { x: pageWidth - 42, y: 20, size: 9, font, color: rgb(.45, .48, .52) }); });
  return { bytes: await pdf.save(), count: slides.length };
}

export async function applyOverlays(file: File, overlays: PdfOverlay[]) { const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib"); const pdf = await PDFDocument.load(await file.arrayBuffer()); const font = await pdf.embedFont(StandardFonts.Helvetica); const hex = (value: string) => { const clean = value.replace("#", ""); return rgb(parseInt(clean.slice(0, 2), 16) / 255, parseInt(clean.slice(2, 4), 16) / 255, parseInt(clean.slice(4, 6), 16) / 255); }; for (const item of overlays) { const page = pdf.getPage(item.page); const height = page.getHeight(); const color = hex(item.color ?? "#2563eb"); if (item.kind === "text") { const size = item.size ?? 18; page.drawText(item.text || "Text", { x: item.x, y: height - item.y - font.heightAtSize(size), size, font, color }); } else if (item.kind === "rect") page.drawRectangle({ x: item.x, y: height - item.y - (item.height ?? 60), width: item.width ?? 120, height: item.height ?? 60, borderColor: color, borderWidth: 2 }); else if (item.kind === "image" && item.dataUrl) { const data = Uint8Array.from(atob(item.dataUrl.split(",")[1]), (char) => char.charCodeAt(0)); const image = item.dataUrl.startsWith("data:image/png") ? await pdf.embedPng(data) : await pdf.embedJpg(data); page.drawImage(image, { x: item.x, y: height - item.y - (item.height ?? 90), width: item.width ?? 120, height: item.height ?? 90 }); } else page.drawLine({ start: { x: item.x, y: height - item.y }, end: { x: item.width ?? item.x + 80, y: height - (item.height ?? item.y + 40) }, thickness: item.size ?? 3, color }); } return pdf.save(); }

export async function addPageNumbers(file: File, position: "bottom-center" | "bottom-right") { const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib"); const pdf = await PDFDocument.load(await file.arrayBuffer()); const font = await pdf.embedFont(StandardFonts.Helvetica); const pages = pdf.getPages(); pages.forEach((page, index) => { const label = `${index + 1} / ${pages.length}`; const size = 10; const width = font.widthOfTextAtSize(label, size); const x = position === "bottom-center" ? (page.getWidth() - width) / 2 : page.getWidth() - width - 24; page.drawText(label, { x, y: 18, size, font, color: rgb(.3, .32, .36) }); }); return pdf.save(); }
