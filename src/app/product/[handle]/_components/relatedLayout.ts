/**
 * Shared layout for the related-products list and its skeleton.
 * Below `lg` it's a swipeable rail that bleeds to the viewport edge (the page
 * wraps it in `section-inset`, so we cancel that with `--inset-x`); from `lg`
 * up it's a 4-column grid.
 */
export const RELATED_LIST_CLASS =
  "hide-scrollbar -mx-(--inset-x) flex snap-x snap-mandatory scroll-px-(--inset-x) gap-4 overflow-x-auto px-(--inset-x) pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0";

/** Rail cards peek the next one on phones; fixed width on tablets. */
export const RELATED_ITEM_CLASS =
  "w-[78%] max-w-80 shrink-0 snap-start sm:w-72 lg:w-auto lg:max-w-none";
