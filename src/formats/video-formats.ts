export const videoFormats = {
  mp4: { label: "MP4", mime: "video/mp4", videoCodec: "libx264", audioCodec: "aac" },
  webm: { label: "WebM", mime: "video/webm", videoCodec: "libvpx-vp9", audioCodec: "libopus" },
  mov: { label: "MOV", mime: "video/quicktime", videoCodec: "libx264", audioCodec: "aac" },
  avi: { label: "AVI", mime: "video/x-msvideo", videoCodec: "mpeg4", audioCodec: "libmp3lame" },
  mkv: { label: "MKV", mime: "video/x-matroska", videoCodec: "libx264", audioCodec: "aac" },
} as const;

export type VideoFormatId = keyof typeof videoFormats;
export const videoFormatIds = Object.keys(videoFormats) as VideoFormatId[];
export const acceptedVideoExtensions = videoFormatIds;
export function videoExtension(name: string) { return videoFormatIds.includes(name.split(".").pop()?.toLowerCase() as VideoFormatId); }
