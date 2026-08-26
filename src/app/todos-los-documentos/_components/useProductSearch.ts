import { useMemo, useState } from "react";

import type { ProductCard } from "@/lib/shopify/types";

import { matchesQuery } from "./searchProducts";

/** Client-side search over an already category-scoped product list. */
export function useProductSearch(products: ProductCard[]) {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(
    () => products.filter((product) => matchesQuery(product, query)),
    [products, query]
  );

  return { query, setQuery, filteredProducts };
}
