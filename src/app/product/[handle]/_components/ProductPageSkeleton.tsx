import { classNames } from "@/lib/utils/classNames";

import { RelatedProductsSkeleton } from "./RelatedProductsSkeleton";

const PLACEHOLDER_TAGS = ["w-40", "w-32", "w-48"];
const PLACEHOLDER_BADGES = 4;
const PLACEHOLDER_ACCORDIONS = 2;

/** Loading placeholder for the product page; mirrors its two-column layout. */
export const ProductPageSkeleton: React.FC = () => {
  return (
    <div className="section-inset pt-28 pb-24" aria-busy="true">
      <span className="sr-only">Cargando documento…</span>

      {/* Breadcrumb */}
      <div className="mb-6 h-5 w-72 max-w-full animate-pulse rounded bg-neutral-100" />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* PDF preview: same mint frame + A4 sheet sizing as PdfViewer */}
        <div className="w-full lg:basis-4/6">
          <div className="bg-primary w-full px-4 pt-8 pb-4 shadow-[inset_0_0_4rem_rgba(12,59,48,0.4)] sm:px-8 sm:pt-16 sm:pb-8">
            <div className="mx-auto aspect-[210/297] w-[min(100%,40rem)] bg-white shadow-md">
              <div className="h-full w-full animate-pulse bg-neutral-100" />
            </div>
          </div>
        </div>

        {/* Product description column */}
        <div className="flex w-full flex-col lg:basis-2/6">
          <div className="space-y-3">
            <div className="h-9 w-full animate-pulse rounded bg-neutral-100" />
            <div className="h-9 w-4/5 animate-pulse rounded bg-neutral-100" />
            <div className="h-9 w-3/5 animate-pulse rounded bg-neutral-100" />
          </div>

          <div className="mt-3 h-6 w-24 animate-pulse rounded bg-neutral-100" />
          <div className="mt-6 h-9 w-32 animate-pulse rounded bg-neutral-100" />

          <div className="mt-8 flex flex-col gap-6">
            <ul className="flex flex-wrap gap-2">
              {PLACEHOLDER_TAGS.map((width, index) => (
                <li
                  key={index}
                  className={classNames(
                    "h-8 animate-pulse rounded-full bg-neutral-100",
                    width
                  )}
                />
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <div className="h-14 w-full animate-pulse bg-neutral-200" />
              <div className="h-14 w-full border border-neutral-200" />
            </div>

            <ul className="grid grid-cols-2 gap-3">
              {Array.from({ length: PLACEHOLDER_BADGES }).map((_, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3"
                >
                  <div className="bg-primary h-9 w-9 shrink-0 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
                  </div>
                </li>
              ))}
            </ul>

            <div>
              {Array.from({ length: PLACEHOLDER_ACCORDIONS }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-t border-neutral-200 py-4 last:border-b"
                  >
                    <div className="h-5 w-36 animate-pulse rounded bg-neutral-100" />
                    <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <RelatedProductsSkeleton />
    </div>
  );
};
