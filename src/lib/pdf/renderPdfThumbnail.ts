import { createCanvas, DOMMatrix, Path2D } from "@napi-rs/canvas";
import type { Canvas } from "@napi-rs/canvas";
import path from "node:path";

/**
 * Server-side rendering of a PDF's first page to a WebP image, used for
 * product card thumbnails. Runs with pdf.js' legacy build, drawing through
 * `@napi-rs/canvas`.
 *
 * We hand pdf.js the canvas library ourselves instead of letting it
 * `require("@napi-rs/canvas")` on its own: that lookup is relative to the
 * bundle's `import.meta.url` and fails in production (Vercel, Bun runtime).
 * Contexts must be created with `willReadFrequently: true` (software
 * rendering) like pdf.js does — a default context segfaults on some of our
 * watermarked PDFs.
 *
 * pdf.js decodes CCITTFax, JBIG2 and JPEG 2000 images (common in scanned
 * documents) and ICC colour profiles with WebAssembly modules it reads from
 * `wasmUrl` — without it those images are dropped and the page renders blank.
 * In Node `wasmUrl` is a directory path, read with `fs`.
 */

const DEFAULT_WIDTH_PX = 1000;
const WEBP_QUALITY = 82;
const DOWNLOAD_TIMEOUT_MS = 30_000;
// Resolved from the project root rather than `import.meta.url`, for the same
// reason as above; shipped via `outputFileTracingIncludes` in next.config.ts.
const PDFJS_WASM_DIR = `${path.join(process.cwd(), "node_modules/pdfjs-dist/wasm")}/`;

interface CanvasAndContext {
  canvas: Canvas | null;
  context: CanvasRenderingContext2D | null;
}

export async function renderPdfThumbnail({
  pdfUrl,
  widthPx = DEFAULT_WIDTH_PX,
}: {
  pdfUrl: string;
  widthPx?: number;
}): Promise<Buffer> {
  const response = await fetch(pdfUrl, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to download PDF (${response.status}): ${pdfUrl}`);
  }

  const data = new Uint8Array(await response.arrayBuffer());
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({
    data,
    CanvasFactory: NapiCanvasFactory,
    wasmUrl: PDFJS_WASM_DIR,
  } as Parameters<typeof pdfjs.getDocument>[0]);
  const doc = await loadingTask.promise;

  try {
    const page = await doc.getPage(1);
    const scale = widthPx / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });
    const { canvas, context } = createCanvasAndContext({
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
    });

    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as CanvasRenderingContext2D,
      viewport,
      background: "#ffffff",
    }).promise;

    return await (canvas as Canvas).encode("webp", WEBP_QUALITY);
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * pdf.js polyfills these globals from `@napi-rs/canvas` when its module is
 * first evaluated, but only if it can resolve the package itself — set them
 * up front so that never matters.
 */
async function loadPdfjs() {
  globalThis.DOMMatrix ??= DOMMatrix as unknown as typeof globalThis.DOMMatrix;
  globalThis.Path2D ??= Path2D as unknown as typeof globalThis.Path2D;

  return import("pdfjs-dist/legacy/build/pdf.mjs");
}

function createCanvasAndContext({
  width,
  height,
}: {
  width: number;
  height: number;
}): CanvasAndContext {
  if (width <= 0 || height <= 0) {
    throw new Error("Invalid canvas size");
  }

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  }) as unknown as CanvasRenderingContext2D;

  return { canvas, context };
}

/**
 * Mirrors pdf.js' internal `NodeCanvasFactory` (used for masks, patterns and
 * other intermediate canvases) without its own package lookup. pdf.js
 * instantiates it with `new CanvasFactory({ enableHWA })`.
 */
class NapiCanvasFactory {
  create(width: number, height: number): CanvasAndContext {
    return createCanvasAndContext({ width, height });
  }

  reset(
    canvasAndContext: CanvasAndContext,
    width: number,
    height: number
  ): void {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified");
    }
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size");
    }
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: CanvasAndContext): void {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified");
    }
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}
