import JSZip from "jszip";

export type DocumentSection = { id: string; title: string; level: number; start: number; end: number; preview: string };
export type DocumentPage = { page: number; start: number; end: number; preview: string };

export async function openDocx(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("This DOCX does not contain a readable document body.");
  const appXml = await zip.file("docProps/app.xml")?.async("string");
  const savedPages = Number(appXml?.match(/<Pages>(\d+)<\/Pages>/)?.[1] ?? 0);
  return { zip, xml, savedPages: savedPages > 0 ? savedPages : undefined };
}

export function parseXml(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) throw new Error("The document XML is invalid.");
  return document;
}

export function documentSections(xml: string): DocumentSection[] {
  const document = parseXml(xml);
  const body = Array.from(document.getElementsByTagNameNS("*", "body"))[0];
  const children = Array.from(body.children).filter((node) => node.localName !== "sectPr");
  const headings: Array<{ index: number; title: string; level: number }> = [];
  children.forEach((node, index) => {
    if (node.localName !== "p") return;
    const style = Array.from(node.getElementsByTagNameNS("*", "pStyle"))[0]?.getAttributeNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "val") ?? Array.from(node.getElementsByTagNameNS("*", "pStyle"))[0]?.getAttribute("w:val") ?? "";
    const match = style.match(/(?:Heading|heading)([1-9])/);
    if (match) headings.push({ index, title: node.textContent?.trim() || `Untitled section ${headings.length + 1}`, level: Number(match[1]) });
  });
  if (!headings.length) return [{ id: "section-1", title: "Entire document", level: 1, start: 0, end: children.length, preview: children.map((item) => item.textContent).join(" ").trim().slice(0, 240) }];
  return headings.map((heading, index) => { const end = headings[index + 1]?.index ?? children.length; return { id: `section-${index + 1}`, title: heading.title, level: heading.level, start: heading.index, end, preview: children.slice(heading.index, end).map((item) => item.textContent).join(" ").trim().slice(0, 240) }; });
}

export function documentPages(xml: string, savedPageCount?: number): { pages: DocumentPage[]; source: "breaks" | "saved-count" | "estimate" } {
  const document = parseXml(xml);
  const body = Array.from(document.getElementsByTagNameNS("*", "body"))[0];
  const children = Array.from(body.children).filter((node) => node.localName !== "sectPr");
  const boundaries = [0]; let hasBreaks = false;
  children.forEach((node, index) => {
    const savedBreak = node.getElementsByTagNameNS("*", "lastRenderedPageBreak").length > 0;
    const manualBreak = Array.from(node.getElementsByTagNameNS("*", "br")).some((br) => (br.getAttribute("w:type") ?? br.getAttributeNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "type")) === "page");
    if ((savedBreak || manualBreak) && index + 1 < children.length) { boundaries.push(index + 1); hasBreaks = true; }
  });
  if (!hasBreaks) {
    const weights = children.map((node) => Math.max(30, (node.textContent?.length ?? 0) + node.getElementsByTagNameNS("*", "drawing").length * 600 + node.getElementsByTagNameNS("*", "tr").length * 60));
    const total = weights.reduce((sum, value) => sum + value, 0);
    const estimatedPages = Math.max(Math.ceil(total / 4200), Math.ceil(children.length / 38));
    const targetPages = Math.max(1, Math.min(children.length || 1, savedPageCount ?? estimatedPages));
    const pageWeight = total / targetPages; let accumulated = 0; let nextTarget = pageWeight;
    weights.forEach((weight, index) => { accumulated += weight; if (boundaries.length < targetPages && accumulated >= nextTarget && index + 1 < children.length) { boundaries.push(index + 1); nextTarget = pageWeight * boundaries.length; } });
  }
  const starts = [...new Set(boundaries)].sort((a, b) => a - b);
  return { source: hasBreaks ? "breaks" : savedPageCount ? "saved-count" : "estimate", pages: starts.map((start, index) => { const end = starts[index + 1] ?? children.length; return { page: index + 1, start, end, preview: children.slice(start, end).map((item) => item.textContent).join(" ").trim().slice(0, 180) }; }) };
}

export function replaceDocumentText(xml: string, search: string, replacement: string, caseSensitive: boolean, wholeWord: boolean) {
  const document = parseXml(xml); let count = 0;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(wholeWord ? `\\b${escaped}\\b` : escaped, caseSensitive ? "g" : "gi");
  for (const paragraph of Array.from(document.getElementsByTagNameNS("*", "p"))) {
    const nodes = Array.from(paragraph.getElementsByTagNameNS("*", "t"));
    if (!nodes.length) continue;
    const source = nodes.map((node) => node.textContent ?? "").join("");
    const matches = Array.from(source.matchAll(pattern));
    if (!matches.length) continue;
    count += matches.length;
    const replaced = source.replace(pattern, replacement);
    nodes[0].textContent = replaced;
    nodes[0].setAttribute("xml:space", "preserve");
    nodes.slice(1).forEach((node) => { node.textContent = ""; });
  }
  return { xml: new XMLSerializer().serializeToString(document), count };
}

export function keepBodyRanges(xml: string, ranges: Array<{ start: number; end: number }>) {
  const document = parseXml(xml); const body = Array.from(document.getElementsByTagNameNS("*", "body"))[0];
  const content = Array.from(body.children).filter((node) => node.localName !== "sectPr");
  const keep = new Set<number>(); ranges.forEach(({ start, end }) => { for (let i = start; i < end; i++) keep.add(i); });
  content.forEach((node, index) => { if (!keep.has(index)) body.removeChild(node); });
  return new XMLSerializer().serializeToString(document);
}

export async function docxWithXml(zip: JSZip, xml: string) {
  zip.file("word/document.xml", xml);
  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

export async function mergeDocx(files: File[]) {
  const base = await openDocx(files[0]);
  const document = parseXml(base.xml); const body = Array.from(document.getElementsByTagNameNS("*", "body"))[0];
  const sectionProperties = Array.from(body.children).find((node) => node.localName === "sectPr") ?? null;
  let rels = await base.zip.file("word/_rels/document.xml.rels")?.async("string") ?? '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
  for (let index = 1; index < files.length; index++) {
    const id = `rIdConvoraChunk${index}`; const name = `afchunk${index}.docx`;
    base.zip.file(`word/${name}`, await files[index].arrayBuffer());
    const pageBreak = document.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:p");
    pageBreak.innerHTML = '<w:r><w:br w:type="page"/></w:r>';
    const chunk = document.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:altChunk");
    chunk.setAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "r:id", id);
    body.insertBefore(pageBreak, sectionProperties); body.insertBefore(chunk, sectionProperties);
    rels = rels.replace("</Relationships>", `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="${name}"/></Relationships>`);
  }
  base.zip.file("word/_rels/document.xml.rels", rels);
  const contentTypes = await base.zip.file("[Content_Types].xml")!.async("string");
  base.zip.file("[Content_Types].xml", contentTypes.includes('Extension="docx"') ? contentTypes : contentTypes.replace("</Types>", '<Default Extension="docx" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"/></Types>'));
  return docxWithXml(base.zip, new XMLSerializer().serializeToString(document));
}
