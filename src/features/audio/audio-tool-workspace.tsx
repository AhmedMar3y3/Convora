"use client";

import { Download, FileAudio, GripVertical, Pause, Play, Scissors, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { acceptedAudioExtensions, audioFormats, type AudioFormatId } from "@/formats/audio-formats";
import { formatBytes } from "@/lib/utils";

type Mode = "convert" | "compress" | "trim" | "merge";
type AudioItem = { id: string; file: File; url: string; duration: number; peaks: number[]; start: number; end: number };
type Result = { url: string; filename: string; size: number; originalSize: number };
const accept = acceptedAudioExtensions.map((item) => `.${item}`).join(",");

const copy = {
  convert: ["Audio Converter", "Convert audio without losing the rhythm.", "Move between MP3, WAV, AAC, M4A, FLAC, OGG, and OPUS with direct bitrate control."],
  compress: ["Audio Compressor", "Make audio lighter, with the savings visible.", "Choose a target bitrate and compare the original file with the compressed result."],
  trim: ["Audio Trimmer", "Keep the moment. Cut everything else.", "Use the waveform and exact time controls to select, preview, and export the section you need."],
  merge: ["Audio Merger", "Arrange clips into one seamless track.", "Add multiple files, drag to reorder, trim each clip, and export one finished audio file."],
} satisfies Record<Mode, string[]>;

export function AudioToolWorkspace({ mode }: { mode: Mode }) {
  const [items, setItems] = useState<AudioItem[]>([]);
  const [format, setFormat] = useState<AudioFormatId>(mode === "compress" ? "mp3" : "mp3");
  const [bitrate, setBitrate] = useState(192);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const itemsRef = useRef<AudioItem[]>([]);
  const resultRef = useRef<Result | null>(null);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { resultRef.current = result; }, [result]);
  useEffect(() => () => { itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url)); if (resultRef.current) URL.revokeObjectURL(resultRef.current.url); }, []);

  async function addFiles(files: File[]) {
    setError(""); setResult(null);
    const selected = mode === "merge" ? files : files.slice(0, 1);
    const decoded = await Promise.all(selected.map(readAudio));
    setItems((current) => mode === "merge" ? [...current, ...decoded] : decoded);
  }

  function update(id: string, values: Partial<AudioItem>) { setItems((current) => current.map((item) => item.id === id ? { ...item, ...values } : item)); }
  function remove(id: string) { setItems((current) => { const match = current.find((item) => item.id === id); if (match) URL.revokeObjectURL(match.url); return current.filter((item) => item.id !== id); }); }
  function reorder(target: number) { if (dragIndex === null || dragIndex === target) return; setItems((current) => { const next = [...current]; const [moved] = next.splice(dragIndex, 1); next.splice(target, 0, moved); return next; }); setDragIndex(null); }

  function preview(item: AudioItem) {
    audioRef.current?.pause();
    if (playing === item.id) { setPlaying(null); return; }
    const audio = new Audio(item.url); audioRef.current = audio; audio.currentTime = item.start;
    audio.play(); setPlaying(item.id);
    const watch = () => { if (audio.currentTime >= item.end) { audio.pause(); setPlaying(null); } else requestAnimationFrame(watch); };
    requestAnimationFrame(watch); audio.onended = () => setPlaying(null);
  }

  async function processAudio() {
    if (!items.length) return;
    setStatus(mode === "merge" ? "Joining clips…" : mode === "trim" ? "Cutting selection…" : mode === "compress" ? "Compressing audio…" : "Converting audio…"); setError("");
    const data = new FormData(); data.set("operation", mode); data.set("format", format); data.set("bitrate", String(bitrate));
    data.set("starts", JSON.stringify(items.map((item) => item.start))); data.set("ends", JSON.stringify(items.map((item) => item.end)));
    items.forEach((item) => data.append("files", item.file));
    try {
      const response = await fetch("/api/audio/process", { method: "POST", body: data });
      if (!response.ok) { const payload = await response.json(); throw new Error(payload.error ?? "Audio processing failed."); }
      const blob = await response.blob(); if (result) URL.revokeObjectURL(result.url);
      setResult({ url: URL.createObjectURL(blob), filename: response.headers.get("X-Convora-Filename") ?? `convora-audio.${format}`, size: blob.size, originalSize: Number(response.headers.get("X-Convora-Original-Size") ?? items.reduce((sum, item) => sum + item.file.size, 0)) });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Audio processing failed."); } finally { setStatus(""); }
  }

  const [eyebrow, title, description] = copy[mode];
  const savings = result ? Math.max(0, Math.round((1 - result.size / result.originalSize) * 100)) : 0;
  return <main className="mx-auto w-[min(1120px,calc(100%-2rem))] py-16">
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">{eyebrow}</p><h1 className="mt-3 max-w-4xl text-4xl font-semibold md:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{description}</p>
    <div className="mt-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
      <aside className="grid content-start gap-5 rounded-[8px] p-5 glass-strong">
        {mode !== "compress" && <SelectFormat value={format} onChange={setFormat} />}
        {(mode === "convert" || mode === "compress" || mode === "merge") && <label className="grid gap-3 text-sm font-semibold">Bitrate <span className="flex items-center justify-between text-xs text-muted"><span>Smaller</span><strong className="text-[var(--foreground)]">{bitrate} kbps</strong><span>Higher quality</span></span><input type="range" min="48" max="320" step="16" value={bitrate} onChange={(event) => setBitrate(Number(event.target.value))} /></label>}
        <Button onClick={processAudio} disabled={!items.length || Boolean(status)}>{mode === "trim" ? <Scissors size={17} /> : <FileAudio size={17} />}{status || ({ convert: "Convert audio", compress: "Compress audio", trim: "Export selection", merge: "Merge clips" }[mode])}</Button>
        {result && <><a href={result.url} download={result.filename} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-5 text-sm font-semibold"><Download size={17} />Download · {formatBytes(result.size)}</a><div className="grid grid-cols-3 gap-2 text-center"><Metric label="Original" value={formatBytes(result.originalSize)} /><Metric label="Output" value={formatBytes(result.size)} /><Metric label="Saved" value={`${savings}%`} accent /></div></>}
        {error && <p className="rounded-[8px] bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
        <p className="text-xs leading-5 text-muted">Files are processed for this request only and are not kept in a library.</p>
      </aside>
      <section>
        <UploadArea multiple={mode === "merge"} onFiles={addFiles} />
        {items.length > 0 && <div className="mt-5 grid gap-3">{items.map((item, index) => <article key={item.id} draggable={mode === "merge"} onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(index)} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-3">{mode === "merge" && <GripVertical size={18} className="cursor-grab text-muted" />}<span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]"><FileAudio size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.file.name}</p><p className="text-xs text-muted">{formatBytes(item.file.size)} · {time(item.duration)}</p></div><button onClick={() => preview(item)} className="grid size-9 place-items-center rounded-full bg-[var(--accent-soft)]" aria-label={playing === item.id ? "Pause preview" : "Play preview"}>{playing === item.id ? <Pause size={15} /> : <Play size={15} />}</button><button onClick={() => remove(item.id)} className="grid size-9 place-items-center rounded-full hover:bg-[var(--accent-soft)]" aria-label={`Remove ${item.file.name}`}><X size={16} /></button></div>
          <Waveform peaks={item.peaks} start={item.start} end={item.end} duration={item.duration} />
          {(mode === "trim" || mode === "merge") && <div className="mt-3 grid grid-cols-2 gap-3"><TimeInput label="Start" value={item.start} max={Math.max(0, item.end - .1)} onChange={(value) => update(item.id, { start: value })} /><TimeInput label="End" value={item.end} min={item.start + .1} max={item.duration} onChange={(value) => update(item.id, { end: value })} /></div>}
        </article>)}</div>}
        {items.length > 0 && <button onClick={() => { items.forEach((item) => URL.revokeObjectURL(item.url)); setItems([]); setResult(null); }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted"><Trash2 size={15} />Clear all</button>}
      </section>
    </div>
  </main>;
}

function UploadArea({ multiple, onFiles }: { multiple: boolean; onFiles: (files: File[]) => void }) { return <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onFiles(Array.from(event.dataTransfer.files)); }} className="relative grid min-h-60 place-items-center rounded-[8px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center"><input id="audio-upload" type="file" accept={accept} multiple={multiple} className="absolute size-px opacity-0" onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) onFiles(files); event.target.value = ""; }} /><label htmlFor="audio-upload" className="cursor-pointer"><UploadCloud size={38} className="mx-auto text-[var(--accent-strong)]" /><h2 className="mt-4 text-xl font-semibold">{multiple ? "Add audio clips" : "Add an audio file"}</h2><p className="mt-2 text-sm text-muted">Drop {multiple ? "files" : "a file"} here or browse MP3, WAV, AAC, M4A, FLAC, OGG, and OPUS up to 100 MB.</p><span className="button-primary mt-5 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold">Browse files</span></label></div>; }
function SelectFormat({ value, onChange }: { value: AudioFormatId; onChange: (value: AudioFormatId) => void }) { return <label className="grid gap-2 text-sm font-semibold">Output format<select value={value} onChange={(event) => onChange(event.target.value as AudioFormatId)} className="h-11 rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] px-3">{Object.entries(audioFormats).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label>; }
function Waveform({ peaks, start, end, duration }: { peaks: number[]; start: number; end: number; duration: number }) { const left = duration ? start / duration * 100 : 0; const width = duration ? (end - start) / duration * 100 : 100; return <div className="relative mt-4 flex h-20 items-center gap-[2px] overflow-hidden rounded-[6px] bg-[var(--accent-soft)] px-2" aria-label="Audio waveform">{peaks.map((peak, index) => <span key={index} className="flex-1 rounded-full bg-[var(--accent-strong)] opacity-55" style={{ height: `${Math.max(8, peak * 92)}%` }} />)}<span className="pointer-events-none absolute inset-y-0 border-x-2 border-[var(--accent)] bg-[var(--accent)]/10" style={{ left: `${left}%`, width: `${width}%` }} /></div>; }
function TimeInput({ label, value, min = 0, max, onChange }: { label: string; value: number; min?: number; max: number; onChange: (value: number) => void }) { return <label className="grid gap-1 text-xs font-semibold text-muted">{label}<input type="number" min={min} max={max} step="0.1" value={value.toFixed(1)} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value))))} className="h-10 rounded-[7px] border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm text-[var(--foreground)]" /></label>; }
function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) { return <div className="rounded-[7px] bg-[var(--accent-soft)] p-2"><p className="text-[10px] uppercase tracking-wide text-muted">{label}</p><p className={accent ? "mt-1 text-sm font-bold text-[var(--accent-strong)]" : "mt-1 text-sm font-semibold"}>{value}</p></div>; }
function time(seconds: number) { const minutes = Math.floor(seconds / 60); return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`; }
async function readAudio(file: File): Promise<AudioItem> { if (file.size > 100 * 1024 * 1024) throw new Error("Each file must be 100 MB or smaller."); const url = URL.createObjectURL(file); const context = new AudioContext(); try { const buffer = await context.decodeAudioData(await file.arrayBuffer()); const channel = buffer.getChannelData(0); const count = 72; const block = Math.max(1, Math.floor(channel.length / count)); const peaks = Array.from({ length: count }, (_, index) => { let peak = 0; for (let i = index * block; i < Math.min(channel.length, (index + 1) * block); i++) peak = Math.max(peak, Math.abs(channel[i])); return peak; }); return { id: crypto.randomUUID(), file, url, duration: buffer.duration, peaks, start: 0, end: buffer.duration }; } finally { await context.close(); } }
