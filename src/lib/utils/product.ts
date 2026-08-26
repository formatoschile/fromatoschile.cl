import type { ProductCard } from "@/lib/shopify/types";
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
