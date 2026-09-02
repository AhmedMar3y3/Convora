<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/convora-mark-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./public/convora-mark-light.png">
    <img alt="Convora logo" src="./public/convora-mark-light.png" width="150">
  </picture>

  # Convora

  **Everything your files need. Nothing they do not.**

  A free, private, runtime-only workspace for converting, editing, inspecting, and organizing files.

  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
</div>

---

## What is Convora?

Convora brings focused file utilities into one consistent interface. There are no accounts, no file history, and no permanent file storage. An upload exists only for the active request: Convora validates it, processes it, returns the result, and releases the request resources.

The project currently ships complete Image and Audio workspaces, plus browser-native QR code and barcode utilities. Dedicated Documents, PDF, and Video workspaces are planned around the same private processing model.

## Image tools

| Tool | Capabilities |
| --- | --- |
| **Image Converter** | Convert between every supported image format |
| **Image Compressor** | Reduce file size while preserving dimensions |
| **Image Resizer** | Resize individual images or batches |
| **Image Cropper** | Single-image, live crop preview with ratios, rotation, and flips |
| **Image to PDF** | Reorder images and generate A4, Letter, or fitted multipage PDFs |
| **Watermark Image** | Text or logo watermarks with position, opacity, scale, and rotation |
| **Rotate & Flip** | Single-image live preview for quarter turns and horizontal/vertical flips |
| **Remove Metadata** | Inspect embedded details and download sanitized copies |
| **Metadata Viewer** | Read dimensions, camera, lens, date, exposure, ISO, focal length, and GPS |

### Supported formats

Every listed image format can be used as both an input and an output:

`JPG` · `PNG` · `WebP` · `AVIF` · `GIF` · `TIFF` · `BMP` · `SVG`

Multiple processed images are returned as a ZIP archive. Image-to-PDF creates one ordered PDF document.

## Audio tools

| Tool | Capabilities |
| --- | --- |
| **Audio Converter** | Convert between MP3, WAV, AAC, M4A, FLAC, OGG, and OPUS |
| **Audio Compressor** | Reduce audio size with direct bitrate control and visible savings |
| **Audio Trimmer** | Select, preview, and export a precise section using a waveform editor |
| **Audio Merger** | Reorder and trim multiple clips before joining them into one track |

## Other tools

These utilities run locally in the browser. Uploaded scanner images are not sent to a Convora processing endpoint.

| Tool | Capabilities |
| --- | --- |
| **QR Code Generator** | Create QR codes for text, URLs, email, phone, SMS, and Wi-Fi credentials; control size, error correction, colors, and margin; export PNG or SVG |
| **QR Code Scanner** | Decode a QR code from an uploaded image, copy its content, or open detected web links |
| **Barcode Generator** | Generate Code 128, Code 39, EAN-13, EAN-8, and UPC-A with scale, height, and readable-text controls; export PNG or SVG |
| **Barcode Scanner** | Detect common barcode formats from an uploaded image and copy the decoded value |

## Private by design

> ### Your files are work, not inventory.
>
> No accounts, no file history, and no permanent storage. Convora validates each upload, processes it for the active request, returns the result, and releases the request resources.

- No signup or user profile
- No database-backed upload library
- No permanent file storage
- Content and extension validation before processing
- Maximum upload size of 18 MB per image
- Server-side processing in the active Node.js request

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js App Router, React 19, strict TypeScript |
| Interface | Tailwind CSS 4, Lucide icons, responsive light/dark themes |
| Image processing | Sharp |
| Metadata | exifr |
| PDF generation | pdf-lib |
| File validation | file-type |
| Batch downloads | JSZip |
| QR code generation | qrcode |
| QR and barcode scanning | ZXing |
| Barcode generation | bwip-js |
| Testing | Vitest |

## Getting started

### Requirements

- Node.js 20 or newer
- pnpm 10

### Installation

```bash
git clone <your-repository-url>
cd convora
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build and run TypeScript checks |
| `pnpm start` | Run the production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the Vitest suite once |
| `pnpm test:watch` | Run tests in watch mode |

## Project structure

```text
src/
├── app/
│   ├── api/                 # Runtime image and audio processing endpoints
│   └── tools/               # Category and individual tool routes
├── components/              # Shared brand and interface components
├── features/images/         # Image tool workspaces
├── features/audio/          # Audio tool workspaces
├── features/other/          # Browser-native QR and barcode workspaces
├── formats/                 # Central format registry
├── processing/              # Sharp processing and validation
└── tools/                   # Tool registry and route metadata
public/
├── convora-mark-light.png
└── convora-mark-dark.png
```

## Processing flow

```text
Browser input or upload
     ↓
Client-side QR/barcode work, or extension, size, and content validation
     ↓
Browser-native processing, or request-time processing with Sharp / FFmpeg / pdf-lib / exifr
     ↓
Single download, PDF, or ZIP response
     ↓
Request resources released
```

## Roadmap

- Document conversion, merging, extraction, and organization
- Dedicated PDF creation, splitting, merging, and protection
- Video conversion, compression, resizing, and trimming

Each category has its own workspace route and will become available independently.

## Contributing

1. Create a focused branch.
2. Keep changes aligned with the existing tool registry and processing boundaries.
3. Add tests proportional to the processing or interface risk.
4. Run `pnpm test` and `pnpm build` before opening a pull request.

---

<div align="center">
  <strong>Free tools. Private files. Clear work.</strong>
</div>
