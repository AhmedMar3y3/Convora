export const audioFormats = {
  mp3: { label: "MP3", mime: "audio/mpeg", codec: "libmp3lame" },
  wav: { label: "WAV", mime: "audio/wav", codec: "pcm_s16le" },
  aac: { label: "AAC", mime: "audio/aac", codec: "aac" },
  m4a: { label: "M4A", mime: "audio/mp4", codec: "aac" },
  flac: { label: "FLAC", mime: "audio/flac", codec: "flac" },
  ogg: { label: "OGG", mime: "audio/ogg", codec: "libvorbis" },
  opus: { label: "OPUS", mime: "audio/ogg", codec: "libopus" },
} as const;

export type AudioFormatId = keyof typeof audioFormats;
export const audioFormatIds = Object.keys(audioFormats) as AudioFormatId[];
export const acceptedAudioExtensions = audioFormatIds;

export function audioExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() as AudioFormatId | undefined;
}
