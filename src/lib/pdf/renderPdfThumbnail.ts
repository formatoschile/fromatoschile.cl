/**
 * Server-side rendering of a PDF's first page to a WebP image, used for
 * product card thumbnails. Runs on Node with pdf.js' legacy build, which
 * draws through `@napi-rs/canvas`.
 *
 * Always create the canvas through `doc.canvasFactory` — a canvas created
 * directly from `@napi-rs/canvas` segfaults on some of our watermarked PDFs.
 */

const DEFAULT_WIDTH_PX = 1000;
const WEBP_QUALITY = 82;
const DOWNLOAD_TIMEOUT_MS = 30_000;

interface EncodableCanvas {
  encode: (format: "webp", quality: number) => Promise<Buffer>;
}

// `doc.canvasFactory` is typed as `object`; on Node it's pdf.js'
// `@napi-rs/canvas` factory.
interface NodeCanvasFactory {
  create: (
    width: number,
    height: number
  ) => { canvas: EncodableCanvas; context: CanvasRenderingContext2D };
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
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;

  try {
    const page = await doc.getPage(1);
    const scale = widthPx / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });
    const { canvas, context } = (doc.canvasFactory as NodeCanvasFactory).create(
      Math.round(viewport.width),
      Math.round(viewport.height)
    );

    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context,
      viewport,
      background: "#ffffff",
    }).promise;

    return await canvas.encode("webp", WEBP_QUALITY);
  } finally {
    await loadingTask.destroy();
  }
}
