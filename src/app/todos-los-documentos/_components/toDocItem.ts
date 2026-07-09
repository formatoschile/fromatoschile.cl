import type { ProductCard } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils/money";

import type { DocItem } from "./types";

/** Maps a Shopify product to the catalog card/modal display model. */
export const toDocItem = (product: ProductCard): DocItem => {
  const variant = product.variants[0];

  const cartData = variant
    ? {
        variant,
        product: {
          id: product.id,
          handle: product.handle,
          title: product.title,
          featuredImage: product.featuredImage,
        },
      }
    : null;

  return {
    title: product.title,
    handle: product.handle,
    variantId: variant?.id ?? "",
    category: product.productType || "General",
    price: formatPrice(product.priceRange.minVariantPrice),
    tags: product.tags,
    previewUrl: product.previewPdf?.reference?.url ?? null,
    cartData,
  };
};
