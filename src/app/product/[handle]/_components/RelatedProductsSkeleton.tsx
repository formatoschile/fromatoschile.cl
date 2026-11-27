import { classNames } from "@/lib/utils/classNames";

import { RELATED_ITEM_CLASS, RELATED_LIST_CLASS } from "./relatedLayout";

const PLACEHOLDER_CARDS = 4;

/** Loading placeholder for {@link RelatedProducts}; mirrors its layout. */
export const RelatedProductsSkeleton: React.FC = () => {
  return (
    <div className="mt-24">
      <div className="mb-6 h-8 w-56 animate-pulse rounded-md bg-neutral-100" />

      <ul className={RELATED_LIST_CLASS}>
        {Array.from({ length: PLACEHOLDER_CARDS }).map((_, index) => (
          <li
            key={index}
            className={classNames(
              RELATED_ITEM_CLASS,
              "flex flex-col border border-neutral-200 p-6"
            )}
          >
            <div className="mb-10 space-y-2">
              <div className="h-5 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-3 border-t border-neutral-200 pt-6">
              <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-100" />
              <div className="h-7 w-14 animate-pulse rounded-md bg-neutral-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
