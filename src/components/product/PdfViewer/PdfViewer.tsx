"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

import { IconButton } from "@/components/ui/IconButton/IconButton";

import { usePdfViewer } from "./usePdfViewer";

interface PdfViewerProps {
  url: string;
}

/** Paginated preview of the watermarked preview PDF, rendered page-by-page with pdf.js. */
export const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
  const {
    canvasRef,
    currentPage,
    numPages,
    isLoading,
    hasError,
    goToPreviousPage,
    goToNextPage,
  } = usePdfViewer(url);

  if (hasError) {
    return (
      <div className="bg-primary flex aspect-[3/4] w-full items-center justify-center p-8 sm:aspect-[4/5]">
        <a href={url} className="text-ink text-sm underline underline-offset-4">
          Ver vista previa (PDF)
        </a>
      </div>
    );
  }

  return (
    <div className="bg-primary relative w-full px-4 pt-8 pb-4 shadow-[inset_0_0_4rem_rgba(12,59,48,0.4)] sm:px-8 sm:pt-16 sm:pb-8">
      {numPages > 1 && (
        <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-2 sm:top-6 sm:right-6">
          <span className="text-ink text-sm">
            {currentPage}/{numPages}
          </span>
          <IconButton
            aria-label="Página anterior"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="h-9 w-9 bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </IconButton>
          <IconButton
            aria-label="Página siguiente"
            onClick={goToNextPage}
            disabled={currentPage === numPages}
            className="h-9 w-9 bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </IconButton>
        </div>
      )}

      <div className="mx-auto flex max-h-[70vh] w-full max-w-md justify-center overflow-hidden bg-white shadow-md sm:max-w-lg">
        {isLoading && (
          <div className="aspect-[1/1.414] w-full animate-pulse bg-neutral-100" />
        )}
        <canvas
          ref={canvasRef}
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- canvas renders pixels, an <img> can't replace it
          role="img"
          aria-label={`Vista previa del documento, página ${currentPage} de ${numPages}`}
          className="max-h-[70vh] w-full object-contain"
          style={{ display: isLoading ? "none" : "block" }}
        />
      </div>

      {/* Canvas alt-text updates aren't reliably announced — call out page
          changes explicitly, and give screen-reader users a real path to the
          actual (tagged) PDF instead of only a canvas image description. */}
      <p aria-live="polite" className="sr-only">
        {numPages > 1
          ? `Página ${currentPage} de ${numPages}`
          : "Vista previa del documento"}
      </p>
      <a
        href={url}
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-white focus:px-2 focus:py-1 focus:text-sm focus:underline"
      >
        Ver documento en PDF
      </a>
    </div>
  );
};
