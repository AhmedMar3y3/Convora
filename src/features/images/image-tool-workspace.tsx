"use client";

import { Crop, Download, FileArchive, ImageIcon, RotateCcw, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { acceptedImageExtensions, getFormatByExtension, outputFormats, type ImageFormatId } from "@/formats/image-formats";
import { cn, formatBytes } from "@/lib/utils";
import type { ToolId } from "@/tools/registry";

type LocalFile = {
  id: string;
  file: File;
  preview: string;
  error?: string;
};

type ResultFile = {
  url: string;
  filename: string;
  outputSize: number;
  originalSize?: number;
  isZip: boolean;
};

const accept = acceptedImageExtensions.map((extension) => `.${extension}`).join(",");

export function ImageToolWorkspace({ toolId }: { toolId: ToolId }) {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [result, setResult] = useState<ResultFile | null>(null);
  const [status, setStatus] = useState<"idle" | "preparing" | "processing" | "finalizing" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState<ImageFormatId>("webp");
  const [quality, setQuality] = useState(82);
  const [width, setWidth] = useState("1200");
  const [height, setHeight] = useState("");
  const [ratio, setRatio] = useState("1:1");
  const [rotate, setRotate] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<LocalFile[]>([]);
  const resultRef = useRef<ResultFile | null>(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => () => {
    filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    if (resultRef.current) {
      URL.revokeObjectURL(resultRef.current.url);
    }
  }, []);

  const operation = toolId.replace("image-", "") as "converter" | "compressor" | "resizer" | "cropper";
  const action = operation === "converter" ? "convert" : operation === "compressor" ? "compress" : operation === "resizer" ? "resize" : "crop";
  const heading = {
    converter: "Convert images into production-ready formats.",
    compressor: "Compress images without guessing the savings.",
    resizer: "Resize batches with predictable dimensions.",
    cropper: "Crop, rotate, and flip with a visual frame.",
  }[operation];

  const cropPreview = useMemo(() => {
    const [x, y] = ratio.split(":").map(Number);
    return Number.isFinite(x) && Number.isFinite(y) && x > 0 && y > 0 ? `${x} / ${y}` : "1 / 1";
  }, [ratio]);

  function addFiles(list: FileList | File[]) {
    const selected = action === "crop" ? Array.from(list).slice(0, 1) : Array.from(list);
    const incoming = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      error: file.size > 18 * 1024 * 1024
        ? "File is larger than 18 MB."
        : !getFormatByExtension(file.name) || (file.type !== "" && !file.type.startsWith("image/"))
          ? "This image format is not supported."
          : undefined,
    }));
    setFiles((current) => {
      if (action === "crop") {
        current.forEach((item) => URL.revokeObjectURL(item.preview));
        return incoming;
      }
      return [...current, ...incoming];
    });
    setResult(null);
    setError("");
    setStatus("idle");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const match = current.find((item) => item.id === id);
      if (match) {
        URL.revokeObjectURL(match.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function clearAll() {
    files.forEach((item) => URL.revokeObjectURL(item.preview));
    if (result) {
      URL.revokeObjectURL(result.url);
    }
    setFiles([]);
    setResult(null);
    setError("");
    setStatus("idle");
  }

  async function processFiles() {
    const validFiles = files.filter((item) => !item.error);
    if (validFiles.length === 0) {
      setError("Add at least one supported image first.");
      setStatus("error");
      return;
    }

    setError("");
    setStatus("preparing");
    await pause(180);
    setStatus("processing");

    const formData = new FormData();
    formData.set("operation", action);
    formData.set("outputFormat", outputFormat);
    formData.set("quality", String(quality));
    if (action === "resize") {
      formData.set("width", width);
      formData.set("height", height);
    }
    if (action === "crop") {
      const [ratioWidth, ratioHeight] = ratio.split(":").map(Number);
      formData.set("crop", JSON.stringify({ left: 0, top: 0, width: ratioWidth, height: ratioHeight, aspectRatio: ratioWidth / ratioHeight, rotate, flipX, flipY }));
    }
    validFiles.forEach((item) => formData.append("files", item.file));

    const response = await fetch("/api/images/process", { method: "POST", body: formData });
    setStatus("finalizing");

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Processing failed." }));
      setError(String(payload.error ?? "Processing failed."));
      setStatus("error");
      return;
    }

    const blob = await response.blob();
    const filename = decodeURIComponent(response.headers.get("X-Convora-Filename") ?? "convora-output");
    if (result) {
      URL.revokeObjectURL(result.url);
    }
    setResult({
      url: URL.createObjectURL(blob),
      filename,
      outputSize: Number(response.headers.get("X-Convora-Output-Size") ?? blob.size),
      originalSize: Number(response.headers.get("X-Convora-Original-Size") || validFiles.reduce((sum, item) => sum + item.file.size, 0)),
      isZip: blob.type === "application/zip",
    });
    setStatus("ready");
  }

  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);
  const saved = result?.originalSize ? Math.max(0, Math.round((1 - result.outputSize / result.originalSize) * 100)) : 0;

  return (
    <section className="mx-auto grid w-[min(1120px,calc(100%-2rem))] gap-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[8px] p-6 glass-strong">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Workspace</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{heading}</h1>
        <p className="mt-4 text-muted">Drag files in, browse from your device, tune the output, and download the result. Nothing is saved permanently.</p>

        <div className="mt-8 grid gap-4">
          {action !== "compress" && (
            <label className="grid gap-2 text-sm font-semibold">
              Output format
              <select value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as ImageFormatId)} className="h-11 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-3">
                {outputFormats.map((format) => (
                  <option key={format} value={format}>{format.toUpperCase()}</option>
                ))}
              </select>
            </label>
          )}

          {(action === "compress" || action === "convert") && (
            <label className="grid gap-2 text-sm font-semibold">
              Quality: {quality}
              <input type="range" min="1" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
            </label>
          )}

          {action === "resize" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">Width<input value={width} onChange={(event) => setWidth(event.target.value)} inputMode="numeric" className="h-11 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-3" /></label>
              <label className="grid gap-2 text-sm font-semibold">Height<input value={height} onChange={(event) => setHeight(event.target.value)} inputMode="numeric" placeholder="Auto" className="h-11 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-3" /></label>
            </div>
          )}

          {action === "crop" && (
            <div className="grid gap-4">
              <div className="grid min-h-80 place-items-center overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--accent-soft)] p-5">
                {files[0] ? (
                  <div className="relative grid max-h-[420px] w-full max-w-[640px] place-items-center overflow-hidden" style={{ aspectRatio: cropPreview }}>
                    <img
                      src={files[0].preview}
                      alt={"Crop preview for " + files[0].file.name}
                      className="absolute inset-0 size-full object-cover transition-transform duration-300"
                      style={{ transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1}) rotate(${rotate}deg)` }}
                    />
                    <span className="pointer-events-none absolute inset-0 border-2 border-white/70 shadow-[0_0_0_999px_rgba(4,19,16,0.26)]" />
                  </div>
                ) : (
                  <div className="text-center"><Crop size={34} className="mx-auto text-[var(--accent-strong)]" /><p className="mt-3 text-sm font-semibold">Your crop preview will appear here</p></div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <select value={ratio} onChange={(event) => setRatio(event.target.value)} className="h-11 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-3" aria-label="Crop ratio">
                  {["1:1", "4:3", "16:9", "3:2"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <Button type="button" variant="secondary" onClick={() => setRotate((value) => (value + 90) % 360)}><RotateCcw size={17} /> Rotate</Button>
                <Button type="button" variant="secondary" onClick={() => setFlipX((value) => !value)}>{flipX ? "Unflip" : "Flip X"}</Button>
              </div>
              <Button type="button" variant="secondary" onClick={() => setFlipY((value) => !value)}>{flipY ? "Remove vertical flip" : "Flip Y"}</Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[8px] p-6 glass">
        <div
          onDragEnter={(event) => { event.preventDefault(); event.stopPropagation(); setDragging(true); }}
          onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = "copy"; setDragging(true); }}
          onDragLeave={(event) => { event.preventDefault(); event.stopPropagation(); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
          onDrop={(event) => { event.preventDefault(); event.stopPropagation(); setDragging(false); if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files); }}
          className={cn("relative grid min-h-64 place-items-center rounded-[8px] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-6 text-center transition", dragging && "scale-[1.01] border-[var(--accent)] bg-[var(--accent-soft)]")}
        >
          <input id={`${toolId}-file-input`} ref={inputRef} type="file" accept={accept} multiple={action !== "crop"} className="peer absolute size-px overflow-hidden opacity-0" onChange={(event) => { if (event.currentTarget.files?.length) addFiles(event.currentTarget.files); }} />
          <label htmlFor={`${toolId}-file-input`} className="grid min-h-52 w-full cursor-pointer place-items-center rounded-[8px] outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-4 peer-focus-visible:ring-offset-[var(--surface-strong)]">
            <span>
              <UploadCloud className="mx-auto text-[var(--accent-strong)]" size={38} aria-hidden />
              <h2 className="mt-4 text-2xl font-semibold">{action === "crop" ? "Drop one image here" : "Drop images here"}</h2>
              <p className="mt-2 text-sm text-muted">or browse JPG, PNG, WebP, AVIF, GIF, TIFF, BMP, and SVG up to 18 MB each.</p>
              <span className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:-translate-y-0.5">Browse files</span>
            </span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{files.length} file{files.length === 1 ? "" : "s"} · {formatBytes(totalSize)}</p>
              <Button type="button" variant="ghost" onClick={clearAll}><Trash2 size={16} /> Clear</Button>
            </div>
            <div className="mt-4 grid gap-3">
              {files.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                  <img src={item.preview} alt="" className="size-14 rounded-[8px] object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.file.name}</p>
                    <p className={cn("text-xs text-muted", item.error && "text-[var(--rose)]")}>{item.error ?? formatBytes(item.file.size)}</p>
                  </div>
                  <button type="button" aria-label={`Remove ${item.file.name}`} onClick={() => removeFile(item.id)} className="grid size-9 place-items-center rounded-full hover:bg-[var(--accent-soft)]"><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={processFiles} disabled={status === "processing" || status === "preparing" || files.length === 0}>
            <ImageIcon size={17} /> {status === "processing" || status === "preparing" ? "Processing" : "Process images"}
          </Button>
          {result && (
            <a href={result.url} download={result.filename} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-5 text-sm font-semibold">
              {result.isZip ? <FileArchive size={17} /> : <Download size={17} />} Download
            </a>
          )}
        </div>

        {status !== "idle" && (
          <div className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-4" role="status" aria-live="polite">
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-[var(--accent-soft)]">
              <div className={cn("h-full rounded-full bg-[var(--accent)] transition-all", status === "ready" ? "w-full" : status === "error" ? "w-1/3 bg-[var(--rose)]" : "w-2/3 animate-pulse")} />
            </div>
            <p className="text-sm font-semibold capitalize">{status}</p>
            {error && <p className="mt-1 text-sm text-[var(--rose)]">{error}</p>}
            {result && (
              <p className="mt-1 text-sm text-muted">
                {result.filename} · {formatBytes(result.outputSize)}{result.originalSize ? ` · saved ${saved}%` : ""}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
