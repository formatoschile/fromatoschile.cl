import type { ProductCard } from "@/lib/shopify/types";

export function matchesQuery(product: ProductCard, query: string): boolean {
  const normalizedQuery = normalize(query.trim());

  if (!normalizedQuery) {
    return true;
  }

  const category = product.productType || "General";
  const haystack = normalize(
    [product.title, category, ...product.tags].join(" ")
  );
  return haystack.includes(normalizedQuery);
}

/** Lowercases and strips accents so "sesión" matches "sesion". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
