import type { ProductCard, ProductVariant } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils/money";

const DEFAULT_CATEGORY = "General";

export function getProductCategory(product: { productType: string }): string {
  return product.productType || DEFAULT_CATEGORY;
}

export function getProductCardDisplay(product: ProductCard): {
  category: string;
  price: string;
} {
  return {
    category: getProductCategory(product),
    price: formatPrice(product.priceRange.minVariantPrice),
  };
}

/**
 * Resolves the variant matching the currently selected options (falling back
 * to the single variant when a product has only one), so callers can check
 * `availableForSale` on the variant the customer actually picked rather than
 * the product as a whole.
 */
export function getSelectedVariant(
  variants: ProductVariant[],
  state: { [key: string]: string }
): ProductVariant | undefined {
  const matchedVariant = variants.find((candidate) =>
    candidate.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );

  if (matchedVariant) {
    return matchedVariant;
  }

  return variants.length === 1 ? variants[0] : undefined;
}

/**
 * Reorders products so every category is spread evenly across the list
 * (e.g. 3 laboral : 1 civil throughout) instead of appearing in blocks.
 * Each product is placed at its relative position within its own category,
 * so the original order inside a category is preserved.
 */
export function interleaveByCategory<T extends { productType: string }>(
  products: T[]
): T[] {
  const byCategory = Map.groupBy(products, getProductCategory);

  return [...byCategory.values()]
    .flatMap((group) =>
      group.map((product, index) => ({
        product,
        position: (index + 0.5) / group.length,
      }))
    )
    .toSorted((a, b) => a.position - b.position)
    .map(({ product }) => product);
}
