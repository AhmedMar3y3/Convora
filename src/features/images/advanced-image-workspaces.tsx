"use client";

import { Download, Eye, FileText, FlipHorizontal2, FlipVertical2, GripVertical, ImageIcon, RotateCw, ShieldCheck, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/button";
import { acceptedImageExtensions } from "@/formats/image-formats";
import { cn, formatBytes } from "@/lib/utils";

type LocalFile = { id: string; file: File; preview: string };
type Result = { url: string; filename: string; size: number };
type MetadataReport = {
  filename: string;
  size: number;
  technical: Record<string, string | number | undefined>;
  camera: Record<string, string | number | undefined>;
  location?: { latitude: number; longitude: number };
};

const accept = acceptedImageExtensions.map((extension) => "." + extension).join(",");

export function ImageToPdfWorkspace() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [margin, setMargin] = useState(24);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function addFiles(next: FileList | File[]) {
    setFiles((current) => [...current, ...Array.from(next).map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }))]);
    setResult(null); setError("");
  }

  function reorder(target: number) {
    if (dragIndex === null || dragIndex === target) return;
    setFiles((current) => { const next = [...current]; const [moved] = next.splice(dragIndex, 1); next.splice(target, 0, moved); return next; });
    setDragIndex(null);
  }

  async function createPdf() {
    if (!files.length) return;
    setStatus("Creating PDF"); setError("");
    const data = new FormData();
    files.forEach(({ file }) => data.append("files", file));
    data.set("pageSize", pageSize); data.set("orientation", orientation); data.set("margin", String(margin));
    await processRequest("/api/images/pdf", data, setResult, setStatus, setError);
  }

  return (
    <WorkspaceShell eyebrow="Image → PDF" title="Turn an ordered image set into one polished PDF." description="Arrange pages, choose the paper, and generate the document entirely at runtime.">
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <ControlPanel>
          <Select label="Page size" value={pageSize} onChange={setPageSize} options={["A4", "Letter", "Fit"]} />
          <Select label="Orientation" value={orientation} onChange={setOrientation} options={["portrait", "landscape"]} />
          <Range label={"Margins: " + margin + " pt"} value={margin} min={0} max={72} onChange={setMargin} />
          <Button onClick={createPdf} disabled={!files.length || Boolean(status)}><FileText size={17} /> {status || "Generate PDF"}</Button>
          <ResultDownload result={result} />
          {error && <ErrorMessage message={error} />}
        </ControlPanel>
        <div>
          <UploadArea id="pdf-upload" multiple onFiles={addFiles} copy="Drop images here or browse. Their order becomes the PDF page order." />
          {files.length > 0 && <div className="mt-4 grid gap-2">
            {files.map((item, index) => (
              <div key={item.id} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(index)} className="flex cursor-grab items-center gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-3 active:cursor-grabbing">
                <GripVertical size={18} className="text-muted" /><span className="grid size-7 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold">{index + 1}</span>
                <img src={item.preview} alt="" className="size-12 rounded-[6px] object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.file.name}</p><p className="text-xs text-muted">{formatBytes(item.file.size)}</p></div>
                <button aria-label={"Remove " + item.file.name} onClick={() => setFiles((current) => current.filter((file) => file.id !== item.id))} className="grid size-9 place-items-center rounded-full hover:bg-[var(--accent-soft)]"><X size={16} /></button>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </WorkspaceShell>
  );
}

export function ImageUtilityWorkspace({ mode }: { mode: "watermark" | "transform" | "strip" | "metadata" }) {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [reports, setReports] = useState<MetadataReport[]>([]);
  const [rotate, setRotate] = useState(90);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [kind, setKind] = useState<"text" | "image">("text");
  const [text, setText] = useState("© Convora");
  const [logo, setLogo] = useState<File | null>(null);
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(60);
  const [size, setSize] = useState(12);
  const [watermarkRotate, setWatermarkRotate] = useState(0);

  const content = {
    watermark: ["Watermark Image", "Protect and brand an entire image batch.", "Text or logo watermarking with precise placement, scale, opacity, and rotation."],
    transform: ["Rotate & Flip", "Correct orientation across a full batch.", "Rotate by exact quarter turns and flip horizontally or vertically without changing formats."],
    strip: ["Remove Metadata / EXIF", "Return clean images without embedded history.", "Inspect camera, date, GPS, and technical metadata before creating sanitized copies."],
    metadata: ["Image Metadata Viewer", "See what an image knows about itself.", "Read dimensions, camera details, capture settings, dates, and GPS data without modifying the file."],
  }[mode];

  function addFiles(next: FileList | File[]) {
    const selected = mode === "transform" ? Array.from(next).slice(0, 1) : Array.from(next);
    const incoming = selected.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }));
    setFiles((current) => {
      if (mode === "transform") {
        current.forEach((item) => URL.revokeObjectURL(item.preview));
        return incoming;
      }
      return [...current, ...incoming];
    });
    setResult(null); setReports([]); setError("");
  }

  async function inspect() {
    if (!files.length) return;
    setStatus("Reading metadata"); setError("");
    const data = new FormData(); files.forEach(({ file }) => data.append("files", file));
    const response = await fetch("/api/images/metadata", { method: "POST", body: data });
    const payload = await response.json();
    if (!response.ok) { setError(payload.error ?? "Unable to read metadata."); setStatus(""); return; }
    setReports(payload.reports); setStatus("");
  }

  async function process() {
    if (!files.length) return;
    setStatus(mode === "strip" ? "Removing metadata" : "Processing images"); setError("");
    const data = new FormData(); files.forEach(({ file }) => data.append("files", file));
    data.set("operation", mode);
    if (mode === "transform") {
      data.set("rotate", String(rotate)); data.set("flipX", String(flipX)); data.set("flipY", String(flipY));
    }
    if (mode === "watermark") {
      data.set("watermarkKind", kind); data.set("watermarkText", text); data.set("position", position);
      data.set("opacity", String(opacity / 100)); data.set("size", String(size)); data.set("watermarkRotate", String(watermarkRotate));
      if (logo) data.set("watermarkFile", logo);
    }
    await processRequest("/api/images/advanced", data, setResult, setStatus, setError);
  }

  return (
    <WorkspaceShell eyebrow={content[0]} title={content[1]} description={content[2]}>
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <ControlPanel>
          {mode === "transform" && <>
            <label className="grid gap-2 text-sm font-semibold">Rotation<div className="grid grid-cols-3 gap-2">{[90, 180, 270].map((value) => <button key={value} onClick={() => setRotate(value)} className={cn("h-10 rounded-[8px] border border-[var(--border)] text-sm", rotate === value && "bg-[var(--accent)] text-[#041310]")}>{value}°</button>)}</div></label>
            <Toggle checked={flipX} onChange={setFlipX} icon={FlipHorizontal2} label="Flip horizontally" />
            <Toggle checked={flipY} onChange={setFlipY} icon={FlipVertical2} label="Flip vertically" />
          </>}
          {mode === "watermark" && <>
            <div className="grid grid-cols-2 gap-2"><Button variant={kind === "text" ? "primary" : "secondary"} onClick={() => setKind("text")}>Text</Button><Button variant={kind === "image" ? "primary" : "secondary"} onClick={() => setKind("image")}>Logo</Button></div>
            {kind === "text" ? <label className="grid gap-2 text-sm font-semibold">Watermark text<input value={text} onChange={(event) => setText(event.target.value)} className="h-11 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-3" /></label> : <label className="grid gap-2 text-sm font-semibold">Watermark image<input type="file" accept={accept} onChange={(event) => setLogo(event.target.files?.[0] ?? null)} className="text-sm font-normal" /></label>}
            <Select label="Position" value={position} onChange={setPosition} options={["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"]} />
            <Range label={"Opacity: " + opacity + "%"} value={opacity} min={5} max={100} onChange={setOpacity} />
            <Range label={"Size: " + size + "%"} value={size} min={2} max={50} onChange={setSize} />
            <Range label={"Rotation: " + watermarkRotate + "°"} value={watermarkRotate} min={-180} max={180} onChange={setWatermarkRotate} />
          </>}
          {(mode === "metadata" || mode === "strip") && <Button variant="secondary" onClick={inspect} disabled={!files.length || Boolean(status)}><Eye size={17} /> Inspect metadata</Button>}
          {mode !== "metadata" && <Button onClick={process} disabled={!files.length || Boolean(status)}>{mode === "strip" ? <ShieldCheck size={17} /> : mode === "transform" ? <RotateCw size={17} /> : <ImageIcon size={17} />}{status || (mode === "strip" ? "Remove metadata" : "Process images")}</Button>}
          {mode === "metadata" && status && <p className="text-sm font-semibold text-muted">{status}</p>}
          <ResultDownload result={result} />
          {error && <ErrorMessage message={error} />}
        </ControlPanel>
        <div>
          {mode === "transform" && (
            <div className="mb-5 grid min-h-[420px] place-items-center overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--accent-soft)] p-6">
              {files[0] ? (
                <img
                  src={files[0].preview}
                  alt={"Transform preview for " + files[0].file.name}
                  className="max-h-[390px] max-w-full object-contain transition-transform duration-300"
                  style={{ transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1}) rotate(${rotate}deg)` }}
                />
              ) : (
                <div className="text-center"><RotateCw size={38} className="mx-auto text-[var(--accent-strong)]" /><p className="mt-4 font-semibold">Your transformed preview will appear here</p><p className="mt-2 text-sm text-muted">Choose one image to begin.</p></div>
              )}
            </div>
          )}
          <UploadArea id={mode + "-upload"} multiple={mode !== "transform"} onFiles={addFiles} copy={mode === "transform" ? "Drop one image here or browse from your device." : "Drop images here or browse from your device."} />
          <FileQueue files={files} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} />
          {reports.length > 0 && <MetadataReports reports={reports} />}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function WorkspaceShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-16"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">{eyebrow}</p><h1 className="mt-3 max-w-4xl text-4xl font-semibold md:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{description}</p><div className="mt-10">{children}</div></main>;
}

function ControlPanel({ children }: { children: React.ReactNode }) { return <aside className="grid content-start gap-5 rounded-[8px] p-5 glass-strong">{children}</aside>; }

function UploadArea({ id, multiple, onFiles, copy }: { id: string; multiple?: boolean; onFiles: (files: File[]) => void; copy: string }) {
  const input = useRef<HTMLInputElement>(null);
  return <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files.length) onFiles(Array.from(event.dataTransfer.files)); }} className="relative grid min-h-56 place-items-center rounded-[8px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
    <input ref={input} id={id} type="file" accept={accept} multiple={multiple} className="absolute size-px opacity-0" onChange={(event) => { const selected = Array.from(event.target.files ?? []); if (selected.length) onFiles(selected); event.target.value = ""; }} />
    <label htmlFor={id} className="cursor-pointer"><UploadCloud className="mx-auto text-[var(--accent-strong)]" size={36} /><h2 className="mt-4 text-xl font-semibold">Add images</h2><p className="mt-2 text-sm text-muted">{copy}</p><span className="button-primary mt-5 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold">Browse files</span></label>
  </div>;
}

function FileQueue({ files, onRemove }: { files: LocalFile[]; onRemove: (id: string) => void }) {
  return files.length ? <div className="mt-4 grid gap-2">{files.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-3"><img src={item.preview} alt="" className="size-12 rounded-[6px] object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.file.name}</p><p className="text-xs text-muted">{formatBytes(item.file.size)}</p></div><button aria-label={"Remove " + item.file.name} onClick={() => onRemove(item.id)} className="grid size-9 place-items-center rounded-full hover:bg-[var(--accent-soft)]"><Trash2 size={16} /></button></div>)}</div> : null;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-3">{options.map((option) => <option key={option} value={option}>{option.replace(/(^|-)(\w)/g, (_, dash, letter) => (dash ? " " : "") + letter.toUpperCase())}</option>)}</select></label>;
}

function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Toggle({ checked, onChange, icon: Icon, label }: { checked: boolean; onChange: (value: boolean) => void; icon: typeof FlipHorizontal2; label: string }) {
  return <label className="flex cursor-pointer items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-3 text-sm font-semibold"><span className="flex items-center gap-2"><Icon size={17} />{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function MetadataReports({ reports }: { reports: MetadataReport[] }) {
  return <div className="mt-6 grid gap-4">{reports.map((report) => <article key={report.filename} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">{report.filename}</h2><p className="mt-1 text-xs text-muted">{formatBytes(report.size)}</p><MetadataGroup title="Technical" values={report.technical} /><MetadataGroup title="Camera & capture" values={report.camera} />{report.location && <MetadataGroup title="Location" values={report.location} />}</article>)}</div>;
}

function MetadataGroup({ title, values }: { title: string; values: Record<string, string | number | undefined> }) {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== "");
  return <div className="mt-5"><h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>{entries.length ? <dl className="mt-3 grid gap-px overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">{entries.map(([key, value]) => <div key={key} className="bg-[var(--surface-strong)] p-3"><dt className="text-xs capitalize text-muted">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="mt-1 break-all text-sm font-semibold">{String(value)}</dd></div>)}</dl> : <p className="mt-2 text-sm text-muted">No embedded {title.toLowerCase()} metadata found.</p>}</div>;
}

function ResultDownload({ result }: { result: Result | null }) {
  return result ? <a href={result.url} download={result.filename} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-5 text-sm font-semibold"><Download size={17} /> Download · {formatBytes(result.size)}</a> : null;
}

function ErrorMessage({ message }: { message: string }) { return <p className="rounded-[8px] bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{message}</p>; }

async function processRequest(url: string, data: FormData, setResult: (result: Result) => void, setStatus: (status: string) => void, setError: (error: string) => void) {
  try {
    const response = await fetch(url, { method: "POST", body: data });
    if (!response.ok) { const payload = await response.json(); throw new Error(payload.error ?? "Processing failed."); }
    const blob = await response.blob();
    setResult({ url: URL.createObjectURL(blob), filename: decodeURIComponent(response.headers.get("X-Convora-Filename") ?? "convora-output"), size: blob.size });
  } catch (error) {
    setError(error instanceof Error ? error.message : "Processing failed.");
  } finally {
    setStatus("");
  }
}
