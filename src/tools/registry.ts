import { AudioLines, Crop, FileOutput, GitMerge, ImageDown, Maximize2, Minimize2, RotateCw, ScanSearch, Scissors, ShieldCheck, Stamp, Waves } from "lucide-react";
import { acceptedImageExtensions, outputFormats } from "@/formats/image-formats";

export type ToolId = "image-converter" | "image-compressor" | "image-resizer" | "image-cropper" | "image-to-pdf" | "image-watermark" | "image-transform" | "image-metadata-remover" | "image-metadata-viewer";

export const tools = [
  {
    id: "image-converter",
    name: "Image Converter",
    shortName: "Convert",
    category: "Images",
    description: "Turn images into modern formats for web, sharing, and archiving.",
    route: "/tools/images/convert",
    icon: ImageDown,
    inputFormats: acceptedImageExtensions,
    outputFormats,
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    shortName: "Compress",
    category: "Images",
    description: "Reduce image weight while keeping dimensions intact.",
    route: "/tools/images/compress",
    icon: Minimize2,
    inputFormats: acceptedImageExtensions,
    outputFormats,
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    shortName: "Resize",
    category: "Images",
    description: "Resize batches with aspect ratio controls and useful presets.",
    route: "/tools/images/resize",
    icon: Maximize2,
    inputFormats: acceptedImageExtensions,
    outputFormats,
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    shortName: "Crop",
    category: "Images",
    description: "Crop, rotate, and flip images with a responsive visual editor.",
    route: "/tools/images/crop",
    icon: Crop,
    inputFormats: acceptedImageExtensions,
    outputFormats,
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    shortName: "Create PDF",
    category: "Images",
    description: "Order multiple images and build one PDF with page and margin controls.",
    route: "/tools/images/to-pdf",
    icon: FileOutput,
    inputFormats: acceptedImageExtensions,
    outputFormats: ["pdf"],
  },
  {
    id: "image-watermark",
    name: "Watermark Image",
    shortName: "Watermark",
    category: "Images",
    description: "Apply text or logo watermarks with position, opacity, scale, and rotation.",
    route: "/tools/images/watermark",
    icon: Stamp,
    inputFormats: acceptedImageExtensions,
    outputFormats,
  },
  {
    id: "image-transform",
    name: "Rotate & Flip",
    shortName: "Transform",
    category: "Images",
    description: "Rotate and flip image batches while preserving their original formats.",
    route: "/tools/images/rotate-flip",
    icon: RotateCw,
    inputFormats: acceptedImageExtensions,
    outputFormats,
  },
  {
    id: "image-metadata-remover",
    name: "Remove Metadata",
    shortName: "Strip EXIF",
    category: "Images",
    description: "Inspect embedded details, then download clean copies without EXIF history.",
    route: "/tools/images/remove-metadata",
    icon: ShieldCheck,
    inputFormats: acceptedImageExtensions,
    outputFormats,
  },
  {
    id: "image-metadata-viewer",
    name: "Metadata Viewer",
    shortName: "Inspect",
    category: "Images",
    description: "View dimensions, camera, capture date, settings, and GPS data when present.",
    route: "/tools/images/metadata",
    icon: ScanSearch,
    inputFormats: acceptedImageExtensions,
    outputFormats: [],
  },
] as const;

export const audioTools = [
  { id: "audio-converter", name: "Audio Converter", shortName: "Convert", category: "Audio", description: "Convert between MP3, WAV, AAC, M4A, FLAC, OGG, and OPUS.", route: "/tools/audio/convert", icon: AudioLines, inputFormats: ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"], outputFormats: ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"] },
  { id: "audio-compressor", name: "Audio Compressor", shortName: "Compress", category: "Audio", description: "Reduce audio size with direct bitrate control and visible savings.", route: "/tools/audio/compress", icon: Waves, inputFormats: ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"], outputFormats: ["mp3"] },
  { id: "audio-trimmer", name: "Audio Trimmer", shortName: "Trim", category: "Audio", description: "Select a precise section on a waveform, preview it, and export.", route: "/tools/audio/trim", icon: Scissors, inputFormats: ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"], outputFormats: ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"] },
  { id: "audio-merger", name: "Audio Merger", shortName: "Merge", category: "Audio", description: "Reorder and trim multiple clips, then join them into one track.", route: "/tools/audio/merge", icon: GitMerge, inputFormats: ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"], outputFormats: ["mp3", "wav", "aac", "m4a", "flac", "ogg", "opus"] },
] as const;

export function getTool(id: ToolId) {
  return tools.find((tool) => tool.id === id);
}
