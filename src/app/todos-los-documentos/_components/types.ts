import type { CartProduct, ProductVariant } from "@/lib/shopify/types";

export interface DocItem {
  title: string;
  handle: string;
  variantId: string;
  category: string;
  price: string;
  tags: string[];
  previewUrl: string | null;
  /** Data for optimistic add-to-cart. Null when the product has no variant. */
  cartData: { variant: ProductVariant; product: CartProduct } | null;
}
