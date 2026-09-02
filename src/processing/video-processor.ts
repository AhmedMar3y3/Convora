import { readFile } from "node:fs/promises";
import { runFfmpeg, saveUpload, withAudioWorkspace } from "@/processing/audio-processor";
import { videoFormats, type VideoFormatId } from "@/formats/video-formats";
import { audioFormats, type AudioFormatId } from "@/formats/audio-formats";

export { saveUpload };
export async function withVideoWorkspace<T>(run: (directory: string) => Promise<T>) { return withAudioWorkspace(run); }

export async function processVideo(input: string, output: string, options: { format: VideoFormatId; quality: "small" | "balanced" | "high"; resolution: string; fps: number; start?: number; end?: number }) {
  const format = videoFormats[options.format];
  const args: string[] = [];
  if (options.start) args.push("-ss", String(options.start));
  args.push("-i", input);
  if (options.end && options.end > (options.start ?? 0)) args.push("-t", String(options.end - (options.start ?? 0)));
  args.push("-c:v", format.videoCodec, "-c:a", format.audioCodec);
  if (format.videoCodec === "libx264") args.push("-preset", options.quality === "small" ? "slow" : "medium", "-crf", options.quality === "small" ? "30" : options.quality === "high" ? "20" : "25", "-pix_fmt", "yuv420p");
  else if (format.videoCodec === "libvpx-vp9") args.push("-crf", options.quality === "small" ? "40" : options.quality === "high" ? "25" : "33", "-b:v", "0");
  else args.push("-q:v", options.quality === "small" ? "8" : options.quality === "high" ? "3" : "5");
  if (options.resolution !== "original") args.push("-vf", `scale=-2:${Number(options.resolution)}`);
  if (options.fps > 0) args.push("-r", String(options.fps));
  if (options.format === "mp4" || options.format === "mov") args.push("-movflags", "+faststart");
  args.push(output); await runFfmpeg(args); return readFile(output);
}

export async function extractAudio(input: string, output: string, format: AudioFormatId) {
  const config = audioFormats[format];
  const args = ["-i", input, "-vn", "-c:a", config.codec];
  if (!['wav', 'flac'].includes(format)) args.push("-b:a", "192k");
  args.push(output); await runFfmpeg(args); return readFile(output);
}
