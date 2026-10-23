import { getProducts, getProductsPage } from "@/lib/shopify";
import type { ProductsPage } from "@/lib/shopify";
import { buildProductSearchQuery } from "@/lib/shopify/search";
import { interleaveByCategory } from "@/lib/utils/product";

import { CATALOG_PAGE_SIZE } from "./constants";

/**
 * One page of the catalog. Filtered/searched views page through Shopify with
 * its cursors. The unfiltered view mixes categories instead (Shopify's sort
 * keys return them in long single-category runs), so it interleaves the full
 * cached product list and pages it with a numeric offset as the cursor.
 */
export async function getCatalogPage({
  category,
  text,
  after,
}: {
  category: string | null;
  text: string | null;
  after?: string;
}): Promise<ProductsPage> {
  if (category || text) {
    return getProductsPage({
      query: buildProductSearchQuery({ category, text }),
      first: CATALOG_PAGE_SIZE,
      after,
    });
  }

  const products = interleaveByCategory(await getProducts({}));
  const offset = parseOffset(after);
  const end = offset + CATALOG_PAGE_SIZE;

  return {
    products: products.slice(offset, end),
    hasNextPage: end < products.length,
    endCursor: end < products.length ? String(end) : null,
  };
}

function parseOffset(after: string | undefined): number {
  const offset = Number.parseInt(after ?? "", 10);
  return Number.isSafeInteger(offset) && offset > 0 ? offset : 0;
}
