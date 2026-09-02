"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileSearch, FileText, LoaderCircle, ShieldCheck, Upload, X } from "lucide-react";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/button";
import { formatBytes } from "@/lib/utils";

export type DocumentToolKind = "ocr" | "scanner" | "word-text" | "viewer" | "metadata" | "compare";
type LoadedDocument = { file: File; text: string; html: string };

const details: Record<DocumentToolKind, { eyebrow: string; title: string; description: string }> = {
  ocr: { eyebrow: "Documents · Image to text", title: "Turn an image into editable text.", description: "Extract words from screenshots, scans, and photos with OCR that runs in your browser." },
  scanner: { eyebrow: "Documents · Scanner", title: "Make photographed pages scan-ready.", description: "Clean up a document photo, tune contrast, and export a sharp PNG or PDF." },
  "word-text": { eyebrow: "Documents · Word to text", title: "Pull clean text from a Word file.", description: "Extract the readable content of DOCX documents for copying or plain-text download." },
  viewer: { eyebrow: "Documents · Viewer", title: "Read documents without opening Office.", description: "Preview DOCX, TXT, Markdown, and RTF files in a quiet, responsive reading view." },
  metadata: { eyebrow: "Documents · Metadata remover", title: "Share a cleaner Word document.", description: "Remove author, company, revision, comments, and tracked-change metadata from DOCX files." },
  compare: { eyebrow: "Documents · Compare", title: "See exactly what changed.", description: "Compare two DOCX, TXT, Markdown, or RTF documents and highlight additions and removals." },
};

export function DocumentToolWorkspace({ kind }: { kind: DocumentToolKind }) {
  const meta = details[kind];
  return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-16"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">{meta.eyebrow}</p><h1 className="mt-3 max-w-4xl text-4xl font-semibold md:text-6xl">{meta.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{meta.description}</p><div className="mt-10">{kind === "ocr" ? <Ocr /> : kind === "scanner" ? <Scanner /> : kind === "word-text" ? <WordText /> : kind === "viewer" ? <Viewer /> : kind === "metadata" ? <MetadataRemover /> : <Compare />}</div></main>;
}

function Dropzone({ accept, label, onFile }: { accept: string; label: string; onFile: (file: File) => void }) {
  return <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-7 text-center transition hover:border-[var(--accent)]"><Upload className="text-[var(--accent-strong)]" /><strong className="mt-4">{label}</strong><span className="mt-2 text-sm text-muted">Processed for this session only</span><input className="sr-only" type="file" accept={accept} onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); e.target.value = ""; }} /></label>;
}
function Workspace({ children }: { children: React.ReactNode }) { return <section className="rounded-[8px] p-6 glass md:p-8">{children}</section>; }
function ErrorAlert({ text }: { text: string }) { return text ? <p className="mt-4 rounded-[8px] bg-[color-mix(in_srgb,var(--rose)_12%,transparent)] p-3 text-sm text-[var(--rose)]">{text}</p> : null; }
function download(content: BlobPart, type: string, filename: string) { const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function fileStem(name: string) { return name.replace(/\.[^.]+$/, ""); }

async function loadDocument(file: File): Promise<LoadedDocument> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const arrayBuffer = await file.arrayBuffer();
    const [text, html] = await Promise.all([mammoth.extractRawText({ arrayBuffer }), mammoth.convertToHtml({ arrayBuffer })]);
    return { file, text: text.value.trim(), html: html.value };
  }
  const raw = await file.text();
  const text = extension === "rtf" ? rtfToText(raw) : raw;
  return { file, text, html: `<pre>${escapeHtml(text)}</pre>` };
}
function rtfToText(value: string) { return value.replace(/\\par[d]?/g, "\n").replace(/\\'[0-9a-fA-F]{2}/g, "").replace(/\\[a-z]+-?\d* ?/g, "").replace(/[{}]/g, "").trim(); }
function escapeHtml(value: string) { return value.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]!)); }

function Ocr() {
  const [file, setFile] = useState<File | null>(null), [text, setText] = useState(""), [error, setError] = useState(""), [progress, setProgress] = useState(0), [busy, setBusy] = useState(false);
  async function run() { if (!file) return; setBusy(true); setError(""); setText(""); try { const Tesseract = await import("tesseract.js"); const result = await Tesseract.recognize(file, "eng", { logger: (message) => { if (message.status === "recognizing text") setProgress(Math.round((message.progress ?? 0) * 100)); } }); setText(result.data.text.trim()); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not read this image."); } finally { setBusy(false); } }
  return <Workspace><Dropzone accept="image/*" label="Choose a screenshot, scan, or photo" onFile={(next) => { setFile(next); setText(""); setProgress(0); }} /><p className="mt-3 text-sm text-muted">OCR currently supports English text only.</p>{file && <FileRow file={file} clear={() => setFile(null)} />}<Button className="mt-5" onClick={run} disabled={!file || busy}>{busy ? <LoaderCircle className="animate-spin" size={17} /> : <FileSearch size={17} />}{busy ? `Reading image… ${progress}%` : "Extract text"}</Button><ErrorAlert text={error} />{text && <TextResult text={text} name="extracted-text.txt" />}</Workspace>;
}

function WordText() {
  const [doc, setDoc] = useState<LoadedDocument | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function load(file: File) { setBusy(true); try { setDoc(await loadDocument(file)); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not read this document."); } finally { setBusy(false); } }
  return <Workspace><Dropzone accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" label="Choose a DOCX file" onFile={load} />{busy && <Busy text="Reading Word document…" />}<ErrorAlert text={error} />{doc && <><FileRow file={doc.file} clear={() => setDoc(null)} /><TextResult text={doc.text} name={`${fileStem(doc.file.name)}.txt`} /></>}</Workspace>;
}

function Viewer() {
  const [doc, setDoc] = useState<LoadedDocument | null>(null), [error, setError] = useState("");
  async function load(file: File) { try { setDoc(await loadDocument(file)); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not open this document."); } }
  return <Workspace><Dropzone accept=".docx,.txt,.md,.rtf,text/plain" label="Choose a DOCX, TXT, Markdown, or RTF file" onFile={load} /><ErrorAlert text={error} />{doc && <><FileRow file={doc.file} clear={() => setDoc(null)} /><article className="mt-5 max-h-[650px] overflow-auto rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 leading-7 [&_h1]:mb-4 [&_h1]:text-3xl [&_h2]:my-4 [&_h2]:text-2xl [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_pre]:whitespace-pre-wrap [&_ul]:list-disc" dangerouslySetInnerHTML={{ __html: doc.html }} /></>}</Workspace>;
}

function Scanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null); const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState(""), [contrast, setContrast] = useState(35), [grayscale, setGrayscale] = useState(true), [error, setError] = useState("");
  async function render(next = file, nextContrast = contrast, nextGray = grayscale) { if (!next) return; try { const bitmap = await createImageBitmap(next); const canvas = canvasRef.current!; const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height)); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale); const context = canvas.getContext("2d")!; context.filter = `${nextGray ? "grayscale(1) " : ""}contrast(${100 + nextContrast}%) brightness(108%)`; context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); setPreview(canvas.toDataURL("image/png")); bitmap.close(); setError(""); } catch { setError("This image could not be processed."); } }
  async function pdf() { if (!preview) return; const bytes = await fetch(preview).then((r) => r.arrayBuffer()); const pdf = await PDFDocument.create(); const image = await pdf.embedPng(bytes); const page = pdf.addPage([image.width, image.height]); page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height }); const saved = await pdf.save(); download(saved.buffer as ArrayBuffer, "application/pdf", `${fileStem(file!.name)}-scan.pdf`); }
  return <Workspace><Dropzone accept="image/*" label="Choose a photo of a document" onFile={(next) => { setFile(next); setTimeout(() => render(next), 0); }} /><canvas ref={canvasRef} className="hidden" /><ErrorAlert text={error} />{preview && <div className="mt-5 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]"><div><label className="text-sm font-semibold">Contrast: {contrast}%</label><input className="mt-3 w-full accent-[var(--accent)]" type="range" min="0" max="100" value={contrast} onChange={(e) => { const value = Number(e.target.value); setContrast(value); render(file, value, grayscale); }} /><label className="mt-5 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={grayscale} onChange={(e) => { setGrayscale(e.target.checked); render(file, contrast, e.target.checked); }} /> Black &amp; white cleanup</label><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => download(dataUrlBytes(preview), "image/png", `${fileStem(file!.name)}-scan.png`)}><Download size={17} /> PNG</Button><Button variant="secondary" onClick={pdf}><FileText size={17} /> PDF</Button></div></div><img src={preview} alt="Cleaned document preview" className="max-h-[620px] w-full rounded-[8px] border border-[var(--border)] bg-white object-contain" /></div>}</Workspace>;
}
function dataUrlBytes(value: string) { const binary = atob(value.split(",")[1]); return Uint8Array.from(binary, (char) => char.charCodeAt(0)); }

function MetadataRemover() {
  const [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [done, setDone] = useState(false), [error, setError] = useState("");
  async function clean() { if (!file) return; setBusy(true); try { const zip = await JSZip.loadAsync(await file.arrayBuffer()); const removals = ["docProps/core.xml", "docProps/custom.xml", "word/comments.xml", "word/commentsExtended.xml", "word/people.xml"]; removals.forEach((path) => zip.remove(path)); const documentXml = await zip.file("word/document.xml")?.async("string"); if (documentXml) zip.file("word/document.xml", documentXml.replace(/<w:(ins|del|moveFrom|moveTo)[^>]*>/g, "").replace(/<\/w:(ins|del|moveFrom|moveTo)>/g, "")); const settings = await zip.file("word/settings.xml")?.async("string"); if (settings) zip.file("word/settings.xml", settings.replace(/<w:trackRevisions\s*\/>/g, "").replace(/<w:documentProtection[^>]*\/>/g, "")); const blob = await zip.generateAsync({ type: "blob", mimeType: file.type }); download(blob, file.type, `${fileStem(file.name)}-clean.docx`); setDone(true); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not clean this document."); } finally { setBusy(false); } }
  return <Workspace><Dropzone accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" label="Choose a DOCX file to sanitize" onFile={(next) => { setFile(next); setDone(false); }} />{file && <FileRow file={file} clear={() => setFile(null)} />}<Button className="mt-5" disabled={!file || busy} onClick={clean}>{busy ? <LoaderCircle className="animate-spin" size={17} /> : <ShieldCheck size={17} />}{busy ? "Cleaning document…" : "Remove metadata & download"}</Button>{done && <p className="mt-4 flex items-center gap-2 text-sm text-[var(--accent-strong)]"><Check size={17} /> Clean copy downloaded.</p>}<ErrorAlert text={error} /></Workspace>;
}

function Compare() {
  const [left, setLeft] = useState<LoadedDocument | null>(null), [right, setRight] = useState<LoadedDocument | null>(null), [error, setError] = useState("");
  async function load(file: File, side: "left" | "right") { try { const doc = await loadDocument(file); if (side === "left") setLeft(doc); else setRight(doc); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not read this document."); } }
  const changes = useMemo(() => left && right ? wordDiff(left.text, right.text) : [], [left, right]);
  return <Workspace><div className="grid gap-4 md:grid-cols-2"><Dropzone accept=".docx,.txt,.md,.rtf,text/plain" label={left ? left.file.name : "Choose original document"} onFile={(file) => load(file, "left")} /><Dropzone accept=".docx,.txt,.md,.rtf,text/plain" label={right ? right.file.name : "Choose revised document"} onFile={(file) => load(file, "right")} /></div><ErrorAlert text={error} />{changes.length > 0 && <><div className="mt-5 flex gap-4 text-xs font-semibold"><span className="rounded-full bg-red-500/15 px-3 py-1 text-[var(--rose)]">Removed</span><span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[var(--accent-strong)]">Added</span></div><div className="mt-4 max-h-[600px] overflow-auto rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 font-mono text-sm leading-7">{changes.map((part, index) => <span key={index} className={part.kind === "add" ? "bg-emerald-500/20 text-[var(--accent-strong)]" : part.kind === "remove" ? "bg-red-500/15 text-[var(--rose)] line-through" : ""}>{part.value} </span>)}</div></>}</Workspace>;
}

function wordDiff(a: string, b: string) { const x = a.split(/\s+/).filter(Boolean), y = b.split(/\s+/).filter(Boolean); const rows = x.length + 1, cols = y.length + 1, dp = new Uint32Array(rows * cols); for (let i = 1; i < rows; i++) for (let j = 1; j < cols; j++) dp[i * cols + j] = x[i - 1] === y[j - 1] ? dp[(i - 1) * cols + j - 1] + 1 : Math.max(dp[(i - 1) * cols + j], dp[i * cols + j - 1]); const parts: { kind: "same" | "add" | "remove"; value: string }[] = []; let i = x.length, j = y.length; while (i || j) { if (i && j && x[i - 1] === y[j - 1]) { parts.push({ kind: "same", value: x[--i] }); j--; } else if (j && (!i || dp[i * cols + j - 1] >= dp[(i - 1) * cols + j])) parts.push({ kind: "add", value: y[--j] }); else parts.push({ kind: "remove", value: x[--i] }); } return parts.reverse(); }

function FileRow({ file, clear }: { file: File; clear: () => void }) { return <div className="mt-4 flex items-center gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-3"><FileText size={19} className="text-[var(--accent-strong)]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-muted">{formatBytes(file.size)}</p></div><button aria-label="Remove file" onClick={clear}><X size={17} /></button></div>; }
function Busy({ text }: { text: string }) { return <p className="mt-4 flex items-center gap-2 text-sm text-muted"><LoaderCircle className="animate-spin" size={17} /> {text}</p>; }
function TextResult({ text, name }: { text: string; name: string }) { const [copied, setCopied] = useState(false); return <div className="mt-5"><textarea readOnly value={text} rows={14} className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-sm leading-6" /><div className="mt-3 flex flex-wrap gap-3"><Button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copied" : "Copy text"}</Button><Button variant="secondary" onClick={() => download(text, "text/plain;charset=utf-8", name)}><Download size={17} /> Download TXT</Button></div></div>; }
