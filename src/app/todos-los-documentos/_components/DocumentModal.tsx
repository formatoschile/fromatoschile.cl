"use client";

import { useRef, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

import { classNames } from "@/lib/classNames";

import type { DocItem } from "./types";

const TOTAL_PAGES = 7;

// Placeholder preview section titles — swap for real metafield data later.
const previewSections = [
  "Encuentra el contrato",
  "Encuentra el contrato",
  "Encuentra el contrato",
];

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

  const goToPage = (target: number) => {
    const clamped = Math.min(Math.max(target, 1), TOTAL_PAGES);
    setPage(clamped);
    const container = scrollRef.current;
    const child = container?.children[clamped - 1] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const distance = container.scrollHeight - container.clientHeight;
    const ratio = distance > 0 ? container.scrollTop / distance : 0;
    setPage(Math.min(TOTAL_PAGES, Math.max(1, Math.round(ratio * (TOTAL_PAGES - 1)) + 1)));
  };

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="grid h-[88vh] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-3">
          {/* Left: preview */}
          <div className="relative hidden min-h-0 bg-primary md:col-span-2 md:block">
            {/* Page controls */}
            <div className="absolute right-6 top-6 z-10 flex flex-col items-center gap-2">
              <span className="text-sm text-neutral-700">
                {page}/{TOTAL_PAGES}
              </span>
              <button
                type="button"
                aria-label="Página anterior"
                onClick={() => goToPage(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-400 bg-white/70 text-neutral-700 transition-colors hover:bg-white"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Página siguiente"
                onClick={() => goToPage(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-400 bg-white/70 text-neutral-700 transition-colors hover:bg-white"
              >
                <ArrowDownIcon className="h-4 w-4" />
              </button>
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
          </div>

          {/* Right: details */}
          <div className="flex min-h-0 flex-col overflow-y-auto p-8 md:col-span-1">
            <h2 className="text-2xl leading-snug text-neutral-800">
              {doc.title}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-widest text-neutral-500">
              {doc.category}
            </p>

            <dl className="mt-6 border-t border-neutral-200">
              {previewSections.map((section, index) => (
                <div key={index} className="border-b border-neutral-200 py-3">
                  <dt className="text-sm font-semibold text-neutral-800">
                    {section}
                  </dt>
                </div>
              ))}
            </dl>

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

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                  {doc.downloads.toLocaleString("es-CL")} descargas
                </span>
                <span className="text-2xl text-neutral-800">€20.00</span>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-md bg-neutral-900 py-4 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-neutral-700"
              >
                Compra
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

/** Placeholder watermarked preview page — real watermarked images come from Shopify later. */
const PreviewPage = () => {
  const lineWidths = [
    "w-full",
    "w-11/12",
    "w-full",
    "w-10/12",
    "w-full",
    "w-9/12",
    "w-11/12",
    "w-8/12",
  ];

  return (
    <div className="relative mx-auto aspect-[1/1.414] w-full max-w-md overflow-hidden rounded-sm bg-white px-10 py-8 shadow-md">
      {/* Watermark */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="-rotate-45 select-none text-4xl font-bold uppercase tracking-widest text-neutral-900/5">
          Vista previa
        </span>
      </span>

      {/* Letterhead */}
      <div className="flex items-center justify-end gap-2 text-neutral-400">
        <span className="font-serif text-lg leading-none">
          <span className="inline-block -scale-x-100">R</span>K
        </span>
        <span className="text-[7px] uppercase leading-tight">
          Retamales
          <br />
          Kowalski
          <br />
          Abogados
        </span>
      </div>

      <div className="mx-auto mt-6 h-1.5 w-3/4 rounded bg-neutral-300" />

      <div className="mt-6 space-y-2">
        {lineWidths.map((width, index) => (
          <div
            key={index}
            className={classNames("h-1 rounded bg-neutral-200", width)}
          />
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {lineWidths.slice(0, 6).map((width, index) => (
          <div
            key={index}
            className={classNames("h-1 rounded bg-neutral-200", width)}
          />
        ))}
      </div>
    </div>
  );
};
