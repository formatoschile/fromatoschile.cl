"use server";

import { getProductsPage } from "@/lib/shopify";
import type { ProductsPage } from "@/lib/shopify";
import { buildProductSearchQuery } from "@/lib/shopify/search";

import { CATALOG_PAGE_SIZE } from "./constants";

export async function loadMoreDocuments({
  category,
  text,
  after,
}: {
  category: string | null;
  text: string | null;
  after: string;
}): Promise<ProductsPage> {
  return getProductsPage({
    query: buildProductSearchQuery({ category, text }),
    first: CATALOG_PAGE_SIZE,
    after,
  });
}
