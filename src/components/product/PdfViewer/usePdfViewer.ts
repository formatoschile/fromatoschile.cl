import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

interface UsePdfViewerResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentPage: number;
  numPages: number;
  isLoading: boolean;
  hasError: boolean;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

/**
 * Loads a PDF with pdf.js and renders the current page to a canvas.
 * Dynamically imports pdf.js so it never lands in the server bundle.
 */
export const usePdfViewer = (url: string): UsePdfViewerResult => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadDocument = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const loadingTask = pdfjs.getDocument({ url });
        loadingTaskRef.current = loadingTask;
        const pdfDocument = await loadingTask.promise;
        if (isCancelled) return;

        documentRef.current = pdfDocument;
        setNumPages(pdfDocument.numPages);
        setCurrentPage(1);
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load PDF document:", error);
          setHasError(true);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
      loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      documentRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    const pdfDocument = documentRef.current;
    const canvas = canvasRef.current;
    if (!pdfDocument || !canvas) return;

    let isCancelled = false;
    let renderTask: ReturnType<
      Awaited<ReturnType<typeof pdfDocument.getPage>>["render"]
    > | null = null;

    const renderPage = async () => {
      const page = await pdfDocument.getPage(currentPage);
      if (isCancelled) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const devicePixelRatio =
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: 2 * devicePixelRatio });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;

      renderTask = page.render({ canvasContext: context, viewport, canvas });
      await renderTask.promise;
    };

    renderPage().catch((error: unknown) => {
      if (!isCancelled) {
        console.error("Failed to render PDF page:", error);
        setHasError(true);
      }
    });

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
    // numPages flips 0 -> N when documentRef.current is first populated, which is
    // what actually triggers the first render.
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [currentPage, numPages]);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(numPages, page + 1));
  };

  return {
    canvasRef,
    currentPage,
    numPages,
    isLoading,
    hasError,
    goToPreviousPage,
    goToNextPage,
  };
};
