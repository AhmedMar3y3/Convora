import { AudioLines, Barcode, Braces, CaseSensitive, Crop, FileAudio2, FileImage, FileJson, FileKey2, FileLock2, FileOutput, FilePenLine, FileSearch, FileSpreadsheet, FileText, Files, Fingerprint, GitCompare, GitMerge, ImageDown, KeyRound, ListOrdered, ListTree, LockKeyhole, Maximize2, Minimize2, Presentation, QrCode, RotateCw, ScanBarcode, ScanLine, ScanSearch, Scissors, ShieldCheck, Sparkles, Stamp, TextCursorInput, UnlockKeyhole, Video, VideoIcon, Waves } from "lucide-react";
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

export const securityTools = [
  { id: "encrypt-file", name: "Encrypt File", shortName: "Encrypt", category: "Security", description: "Password-encrypt any file with authenticated AES-256-GCM encryption.", route: "/tools/security/encrypt", icon: FileLock2 },
  { id: "decrypt-file", name: "Decrypt File", shortName: "Decrypt", category: "Security", description: "Restore a file encrypted by Convora and verify that it was not altered.", route: "/tools/security/decrypt", icon: FileKey2 },
  { id: "file-hash", name: "File Hash & Checksum", shortName: "Hash file", category: "Security", description: "Generate SHA checksums or verify a file against a known hash.", route: "/tools/security/hash", icon: Fingerprint },
  { id: "password-generator", name: "Password Generator", shortName: "Generate", category: "Security", description: "Create strong passwords locally with length and character controls.", route: "/tools/security/password-generator", icon: KeyRound },
] as const;

export const documentTools = [
  { id: "image-to-text", name: "Image to Text (OCR)", shortName: "Extract text", category: "Documents", description: "Extract editable text from screenshots, scans, and photos in your browser.", route: "/tools/documents/image-to-text", icon: FileSearch },
  { id: "document-scanner", name: "Document Scanner", shortName: "Scan document", category: "Documents", description: "Clean up a photographed page and export it as a sharp PNG or PDF.", route: "/tools/documents/scanner", icon: ScanLine },
  { id: "word-to-text", name: "Word to Text", shortName: "Extract text", category: "Documents", description: "Pull clean, reusable text from DOCX documents without opening Word.", route: "/tools/documents/word-to-text", icon: FileText },
  { id: "document-viewer", name: "Document Viewer", shortName: "View document", category: "Documents", description: "Read DOCX, TXT, Markdown, and RTF files in a focused browser view.", route: "/tools/documents/viewer", icon: FileText },
  { id: "document-metadata", name: "Document Metadata Remover", shortName: "Clean document", category: "Documents", description: "Remove author details, comments, revisions, and hidden DOCX metadata.", route: "/tools/documents/remove-metadata", icon: ShieldCheck },
  { id: "document-compare", name: "Document Compare", shortName: "Compare files", category: "Documents", description: "Compare two documents and highlight words that were added or removed.", route: "/tools/documents/compare", icon: GitCompare },
  { id: "extract-document-images", name: "Extract Images", shortName: "Extract images", category: "Documents", description: "Recover embedded DOCX images at their original quality and download them together.", route: "/tools/documents/extract-images", icon: FileImage },
  { id: "document-find-replace", name: "Find & Replace", shortName: "Replace text", category: "Documents", description: "Find repeated text in a DOCX and replace every match while retaining its structure.", route: "/tools/documents/find-replace", icon: TextCursorInput },
  { id: "merge-documents", name: "Merge Documents", shortName: "Merge documents", category: "Documents", description: "Arrange multiple Word files and combine them into one ordered DOCX.", route: "/tools/documents/merge", icon: GitMerge },
  { id: "split-document", name: "Split Document", shortName: "Split document", category: "Documents", description: "Define page ranges and export each range as a separate Word document.", route: "/tools/documents/split", icon: Scissors },
  { id: "extract-document-sections", name: "Extract Sections", shortName: "Choose sections", category: "Documents", description: "Select heading-defined sections and create a focused new DOCX.", route: "/tools/documents/extract-sections", icon: ListTree },
  { id: "document-counter", name: "Word & Character Counter", shortName: "Count text", category: "Documents", description: "Measure words, characters, sentences, paragraphs, reading time, and speaking time.", route: "/tools/documents/counter", icon: CaseSensitive },
] as const;

export const pdfTools = [
  { id: "merge-pdf", name: "Merge PDF", shortName: "Merge", category: "PDF", description: "Arrange multiple PDFs and combine them into one lossless document.", route: "/tools/pdf/merge", icon: GitMerge },
  { id: "split-pdf", name: "Split PDF", shortName: "Split", category: "PDF", description: "Split a PDF by ranges, individual pages, or evenly sized groups.", route: "/tools/pdf/split", icon: Scissors },
  { id: "remove-pdf-pages", name: "Remove PDF Pages", shortName: "Remove pages", category: "PDF", description: "Select unwanted pages visually and create a clean new PDF.", route: "/tools/pdf/remove-pages", icon: FileOutput },
  { id: "extract-pdf-pages", name: "Extract PDF Pages", shortName: "Extract pages", category: "PDF", description: "Keep selected pages in their original order as a new PDF.", route: "/tools/pdf/extract-pages", icon: Files },
  { id: "organize-pdf", name: "Organize PDF", shortName: "Organize", category: "PDF", description: "Reorder, rotate, duplicate, and remove pages in a visual workspace.", route: "/tools/pdf/organize", icon: ListTree },
  { id: "compress-pdf", name: "Compress PDF", shortName: "Compress", category: "PDF", description: "Optimize PDF structure and see honest before-and-after savings.", route: "/tools/pdf/compress", icon: Minimize2 },
  { id: "word-to-pdf", name: "Word to PDF", shortName: "Convert Word", category: "PDF", description: "Convert DOCX documents to PDF with an honest browser-rendered preview.", route: "/tools/pdf/word-to-pdf", icon: FileText },
  { id: "powerpoint-to-pdf", name: "PowerPoint to PDF", shortName: "Extract slide text", category: "PDF", description: "Extract slide text in order and create one readable PDF page per slide.", route: "/tools/pdf/powerpoint-to-pdf", icon: Presentation },
  { id: "excel-to-pdf", name: "Excel to PDF", shortName: "Convert sheets", category: "PDF", description: "Choose workbook sheets and export them with practical page controls.", route: "/tools/pdf/excel-to-pdf", icon: FileSpreadsheet },
  { id: "html-to-pdf", name: "HTML to PDF", shortName: "Convert HTML", category: "PDF", description: "Preview sanitized HTML and export a styled PDF without running scripts.", route: "/tools/pdf/html-to-pdf", icon: Braces },
  { id: "pdf-to-word", name: "PDF to Word", shortName: "Create DOCX", category: "PDF", description: "Rebuild text-based PDFs as editable Word documents.", route: "/tools/pdf/pdf-to-word", icon: FileOutput },
  { id: "edit-pdf", name: "Edit PDF", shortName: "Add overlays", category: "PDF", description: "Add text, shapes, images, and freehand marks without altering original content.", route: "/tools/pdf/edit", icon: FilePenLine },
  { id: "protect-pdf", name: "Protect PDF", shortName: "Encrypt", category: "PDF", description: "Protect a PDF locally with AES-256 and optional document permissions.", route: "/tools/pdf/protect", icon: LockKeyhole },
  { id: "unlock-pdf", name: "Unlock PDF", shortName: "Remove password", category: "PDF", description: "Remove PDF protection locally when you know the current password.", route: "/tools/pdf/unlock", icon: UnlockKeyhole },
  { id: "page-numbers-pdf", name: "Add Page Numbers", shortName: "Number pages", category: "PDF", description: "Add simple page numbers to every page of a PDF.", route: "/tools/pdf/page-numbers", icon: ListOrdered },
] as const;

export function getTool(id: ToolId) {
  return tools.find((tool) => tool.id === id);
}
