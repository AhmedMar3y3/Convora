import { AudioLines, Barcode, Braces, Crop, FileAudio2, FileJson, FileOutput, FileSpreadsheet, Files, GitMerge, ImageDown, Maximize2, Minimize2, QrCode, RotateCw, ScanBarcode, ScanLine, ScanSearch, Scissors, ShieldCheck, Sparkles, Stamp, Video, VideoIcon, Waves } from "lucide-react";
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

export const videoTools = [
  { id: "video-converter", name: "Video Converter", shortName: "Convert", category: "Video", description: "Convert MP4, WebM, MOV, AVI, and MKV with practical resolution, quality, codec, and FPS controls.", route: "/tools/video/convert", icon: Video, inputFormats: ["mp4", "webm", "mov", "avi", "mkv"], outputFormats: ["mp4", "webm", "mov", "avi", "mkv"] },
  { id: "video-compressor", name: "Video Compressor", shortName: "Compress", category: "Video", description: "Make videos lighter with simple quality presets and a clear before-and-after size comparison.", route: "/tools/video/compress", icon: VideoIcon, inputFormats: ["mp4", "webm", "mov", "avi", "mkv"], outputFormats: ["mp4"] },
  { id: "video-trimmer", name: "Video Trimmer", shortName: "Trim", category: "Video", description: "Choose start and end points on a timeline, preview the selection, and export the moment you need.", route: "/tools/video/trim", icon: Scissors, inputFormats: ["mp4", "webm", "mov", "avi", "mkv"], outputFormats: ["mp4", "webm", "mov", "avi", "mkv"] },
  { id: "video-to-audio", name: "Video to Audio", shortName: "Extract audio", category: "Video", description: "Pull the soundtrack from a video and save it as MP3, WAV, AAC, M4A, or FLAC.", route: "/tools/video/to-audio", icon: FileAudio2, inputFormats: ["mp4", "webm", "mov", "avi", "mkv"], outputFormats: ["mp3", "wav", "aac", "m4a", "flac"] },
] as const;

export const otherTools = [
  { id: "qr-generator", name: "QR Code Generator", shortName: "Generate QR", category: "Other", description: "Create custom QR codes for text, links, contact details, messages, and Wi-Fi.", route: "/tools/other/qr-generator", icon: QrCode },
  { id: "qr-scanner", name: "QR Code Scanner", shortName: "Scan QR", category: "Other", description: "Upload a QR code image, decode its content, then copy or open the result.", route: "/tools/other/qr-scanner", icon: ScanLine },
  { id: "barcode-generator", name: "Barcode Generator", shortName: "Generate barcode", category: "Other", description: "Generate Code 128, Code 39, EAN-13, EAN-8, and UPC-A barcodes.", route: "/tools/other/barcode-generator", icon: Barcode },
  { id: "barcode-scanner", name: "Barcode Scanner", shortName: "Scan barcode", category: "Other", description: "Read common barcode formats from an image and copy the decoded value.", route: "/tools/other/barcode-scanner", icon: ScanBarcode },
] as const;

export const dataTools = [
  { id: "csv-json", name: "CSV ↔ JSON Converter", shortName: "Convert", category: "Data", description: "Convert CSV to JSON and structured JSON back to CSV.", route: "/tools/data/csv-json", icon: FileJson },
  { id: "csv-excel", name: "CSV ↔ Excel Converter", shortName: "Convert", category: "Data", description: "Move between CSV and XLSX while keeping headers and rows intact.", route: "/tools/data/csv-excel", icon: FileSpreadsheet },
  { id: "json-formatter", name: "JSON Formatter & Viewer", shortName: "Format JSON", category: "Data", description: "Validate, prettify, minify, search, and explore JSON.", route: "/tools/data/json-formatter", icon: Braces },
  { id: "merge-csv", name: "Merge CSV & Excel Files", shortName: "Merge files", category: "Data", description: "Combine CSV and Excel files and align their columns by header.", route: "/tools/data/merge-csv", icon: Files },
  { id: "split-csv", name: "Split CSV & Excel", shortName: "Split file", category: "Data", description: "Split large CSV or Excel files by rows or a target file count.", route: "/tools/data/split-csv", icon: Scissors },
  { id: "csv-deduplicator", name: "CSV & Excel Deduplicator", shortName: "Remove duplicates", category: "Data", description: "Detect and remove duplicate rows from CSV or XLSX using the columns you select.", route: "/tools/data/deduplicate-csv", icon: Sparkles },
] as const;

export function getTool(id: ToolId) {
  return tools.find((tool) => tool.id === id);
}
