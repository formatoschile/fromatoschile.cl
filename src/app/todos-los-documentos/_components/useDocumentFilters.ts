import { useMemo, useState } from "react";

import type { ProductCard } from "@/lib/shopify/types";

import { matchesQuery } from "./searchProducts";

interface CategoryCount {
  label: string;
  count: number;
}

/** Client-side search + category filtering over the fetched catalog. */
export function useDocumentFilters(
  products: ProductCard[],
  initialCategory: string | null = null
) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory
  );

  const categories = useMemo<CategoryCount[]>(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const category = product.productType || "General";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return Array.from(counts, ([label, count]) => ({ label, count }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const category = product.productType || "General";

      if (selectedCategory && category !== selectedCategory) {
        return false;
      }

      return matchesQuery(product, query);
    });
  }, [products, query, selectedCategory]);

  const toggleCategory = (category: string) => {
    setSelectedCategory((current) => (current === category ? null : category));
  };

  return {
    query,
    setQuery,
    categories,
    selectedCategory,
    toggleCategory,
    filteredProducts,
  };
}
