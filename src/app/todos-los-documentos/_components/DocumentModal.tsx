"use client";

import { Suspense, useRef, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyButton } from "@/components/cart/BuyButton";
import { IconButton } from "@/components/ui/IconButton/IconButton";

import { PreviewPage } from "./PreviewPlaceholder";
import type { DocItem } from "./types";

const TOTAL_PAGES = 7;

interface DocumentModalProps {
  doc: DocItem | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  doc,
  onClose,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  if (!doc) {
    return null;
  }

  const hasPreview = Boolean(doc.previewUrl);

  const goToPage = (target: number) => {
    const clamped = Math.min(Math.max(target, 1), TOTAL_PAGES);
    setPage(clamped);
    const container = scrollRef.current;
    const child = container?.children[clamped - 1] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrevPage = () => goToPage(page - 1);
  const handleNextPage = () => goToPage(page + 1);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const distance = container.scrollHeight - container.clientHeight;
    const ratio = distance > 0 ? container.scrollTop / distance : 0;
    setPage(
      Math.min(
        TOTAL_PAGES,
        Math.max(1, Math.round(ratio * (TOTAL_PAGES - 1)) + 1)
      )
    );
  };

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="grid h-[88vh] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-3">
          {/* Left: preview */}
          <div className="bg-primary relative hidden min-h-0 md:col-span-2 md:block">
            {hasPreview ? (
              <object
                data={`${doc.previewUrl}#toolbar=0`}
                type="application/pdf"
                aria-label={`Vista previa de ${doc.title}`}
                className="h-full w-full"
              >
                <a
                  href={doc.previewUrl ?? undefined}
                  className="flex h-full items-center justify-center text-sm text-neutral-700 underline"
                >
                  Ver vista previa (PDF)
                </a>
              </object>
            ) : (
              <>
                {/* Page controls */}
                <div className="absolute top-6 right-6 z-10 flex flex-col items-center gap-2">
                  <span className="text-sm text-neutral-700">
                    {page}/{TOTAL_PAGES}
                  </span>
                  <IconButton
                    aria-label="Página anterior"
                    onClick={handlePrevPage}
                    className="h-9 w-9 bg-white/70"
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    aria-label="Página siguiente"
                    onClick={handleNextPage}
                    className="h-9 w-9 bg-white/70"
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </IconButton>
                </div>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="h-full space-y-6 overflow-y-auto p-8"
                >
                  {Array.from({ length: TOTAL_PAGES }).map((_, index) => (
                    <PreviewPage key={index} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: details */}
          <div className="flex min-h-0 flex-col overflow-y-auto p-8 md:col-span-1">
            <h2 className="text-ink text-2xl leading-snug">{doc.title}</h2>
            <p className="mt-2 text-xs tracking-widest text-neutral-500 uppercase">
              {doc.category}
            </p>

            <div className="mt-auto pt-8">
              <div className="flex flex-wrap gap-2">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-neutral-100 px-3 py-1.5 text-xs text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-end">
                <span className="text-ink text-4xl">{doc.price}</span>
              </div>

              <BuyButton
                variantId={doc.variantId}
                className="bg-charcoal hover:bg-charcoal/80 mt-6 w-full rounded-md py-4 text-sm font-medium tracking-wider text-white uppercase"
              />

              {doc.cartData ? (
                <Suspense fallback={<AddToCartFallback />}>
                  <AddToCartButton
                    variant={doc.cartData.variant}
                    product={doc.cartData.product}
                    onAdd={onClose}
                    className="text-ink mt-3 w-full rounded-md border border-neutral-300 py-4 text-sm font-medium tracking-wider uppercase hover:bg-neutral-100"
                  />
                </Suspense>
              ) : null}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

/** Matches AddToCartButton's layout while the cart promise resolves. */
const AddToCartFallback = () => {
  return (
    <button
      type="button"
      disabled
      className="text-ink mt-3 w-full cursor-wait rounded-md border border-neutral-300 py-4 text-sm font-medium tracking-wider uppercase opacity-60"
    >
      Agregar al carrito
    </button>
  );
};
