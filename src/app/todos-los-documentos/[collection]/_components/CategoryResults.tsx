import { getProductsPage } from "@/lib/shopify";
import { buildProductSearchQuery } from "@/lib/shopify/search";
import { defaultSort, sorting } from "@/lib/utils/constants";

import { CATALOG_PAGE_SIZE } from "../../_components/constants";

import { CategoryCatalog } from "./CategoryCatalog";

interface CategoryResultsProps {
  categoryTitle: string;
  searchParams?: Promise<{ q?: string; sort?: string }>;
}

/** Reads `searchParams` — kept out of the static shell via the caller's `<Suspense>`. */
export const CategoryResults = async ({
  categoryTitle,
  searchParams,
}: CategoryResultsProps) => {
  const params = await searchParams;
  const text = params?.q ?? null;
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === params?.sort) || defaultSort;

  const page = await getProductsPage({
    query: buildProductSearchQuery({ category: categoryTitle, text }),
    sortKey,
    reverse,
    first: CATALOG_PAGE_SIZE,
  });

  return (
    <CategoryCatalog
      key={text ?? ""}
      categoryTitle={categoryTitle}
      query={text ?? ""}
      initialProducts={page.products}
      initialHasNextPage={page.hasNextPage}
      initialEndCursor={page.endCursor}
    />
  );
};
