"use server";

import type { ProductsPage } from "@/lib/shopify";

import { getCatalogPage } from "./getCatalogPage";

export async function loadMoreDocuments({
  category,
  text,
  after,
}: {
  category: string | null;
  text: string | null;
  after: string;
}): Promise<ProductsPage> {
  return getCatalogPage({ category, text, after });
}
