import { getCollections } from "@/lib/shopify";

import { DocumentsCatalog } from "./DocumentsCatalog";
import { getCatalogPage } from "./getCatalogPage";

interface CatalogResultsProps {
  searchParams?: Promise<{ categoria?: string; q?: string }>;
}

/** Reads `searchParams` — kept out of the static shell via the caller's `<Suspense>`. */
export const CatalogResults: React.FC<CatalogResultsProps> = async ({
  searchParams,
}) => {
  const params = await searchParams;
  const category = params?.categoria ?? null;
  const text = params?.q ?? null;

  const [collections, page] = await Promise.all([
    getCollections(),
    getCatalogPage({ category, text }),
  ]);

  return (
    <DocumentsCatalog
      categories={collections}
      selectedCategory={category}
      query={text ?? ""}
      initialProducts={page.products}
      initialHasNextPage={page.hasNextPage}
      initialEndCursor={page.endCursor}
    />
  );
};
