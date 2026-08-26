import { getCollections, getProductsPage } from "@/lib/shopify";
import { buildProductSearchQuery } from "@/lib/shopify/search";

import { CATALOG_PAGE_SIZE } from "./constants";
import { DocumentsCatalog } from "./DocumentsCatalog";

interface CatalogResultsProps {
  searchParams?: Promise<{ categoria?: string; q?: string }>;
}

/** Reads `searchParams` — kept out of the static shell via the caller's `<Suspense>`. */
export const CatalogResults = async ({ searchParams }: CatalogResultsProps) => {
  const params = await searchParams;
  const category = params?.categoria ?? null;
  const text = params?.q ?? null;

  const [collections, page] = await Promise.all([
    getCollections(),
    getProductsPage({
      query: buildProductSearchQuery({ category, text }),
      first: CATALOG_PAGE_SIZE,
    }),
  ]);

  return (
    <DocumentsCatalog
      key={`${category ?? "all"}:${text ?? ""}`}
      categories={collections}
      selectedCategory={category}
      query={text ?? ""}
      initialProducts={page.products}
      initialHasNextPage={page.hasNextPage}
      initialEndCursor={page.endCursor}
    />
  );
};
