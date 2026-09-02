import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { audioFormats, type AudioFormatId } from "@/formats/audio-formats";

export async function withAudioWorkspace<T>(run: (directory: string) => Promise<T>) {
  const directory = await mkdtemp(path.join(tmpdir(), "convora-audio-"));
  try { return await run(directory); } finally { await rm(directory, { recursive: true, force: true }); }
}

export async function saveUpload(file: File, directory: string, index = 0) {
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "audio";
  const target = path.join(directory, `input-${index}.${extension}`);
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return target;
}

export async function runFfmpeg(args: string[]) {
  const bundledName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const projectBinary = path.join(process.cwd(), "node_modules", "ffmpeg-static", bundledName);
  const executable = ffmpegPath && existsSync(ffmpegPath) ? ffmpegPath : projectBinary;
  if (!existsSync(executable)) throw new Error("Audio engine is unavailable. Reinstall dependencies and restart the server.");
  await new Promise<void>((resolve, reject) => {
    execFile(executable, ["-hide_banner", "-loglevel", "error", "-y", ...args], { windowsHide: true, maxBuffer: 2 * 1024 * 1024 }, (error, _stdout, stderr) => error ? reject(new Error([stderr.trim(), error.message].filter(Boolean).join("\n") || "Audio processing failed.")) : resolve());
  });
}

export async function transcode(input: string, output: string, format: AudioFormatId, bitrate?: number, trim?: { start: number; end?: number }) {
  const args: string[] = [];
  if (trim?.start) args.push("-ss", String(trim.start));
  args.push("-i", input);
  if (trim?.end && trim.end > trim.start) args.push("-t", String(trim.end - trim.start));
  args.push("-vn", "-c:a", audioFormats[format].codec);
  if (bitrate && !["wav", "flac"].includes(format)) args.push("-b:a", `${bitrate}k`);
  args.push(output);
  await runFfmpeg(args);
  return readFile(output);
}
