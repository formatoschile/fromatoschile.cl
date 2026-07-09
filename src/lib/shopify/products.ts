import { cacheLife, cacheTag } from "next/cache";

import { HIDDEN_PRODUCT_TAG, TAGS } from "@/lib/utils/constants";

import {
  getProductByIdQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import { shopifyFetch } from "./client";
import {
  removeEdgesAndNodes,
  reshapeProduct,
  reshapeProducts,
} from "./reshape";
import type {
  Product,
  ProductCard,
  ShopifyProductByIdOperation,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
} from "./types";

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  return reshapeProduct(res.body.data.product, false);
}

export async function getProductById(
  productId: string
): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  // Shopify expects the full GID format
  const gid = productId.startsWith("gid://")
    ? productId
    : `gid://shopify/Product/${productId}`;

  const res = await shopifyFetch<ShopifyProductByIdOperation>({
    query: getProductByIdQuery,
    variables: {
      id: gid,
    },
  });

  return reshapeProduct(res.body.data.product, false);
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId,
    },
  });

  return reshapeProducts(res.body.data.productRecommendations);
}

/**
 * Lightweight product listing (catalog cards, sitemap). Uses the slim
 * `productCard` fragment — use `getProduct` for the full product detail.
 */
export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<ProductCard[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return removeEdgesAndNodes(res.body.data.products)
    .filter((product) => !product.tags.includes(HIDDEN_PRODUCT_TAG))
    .map((product) => ({
      ...product,
      variants: removeEdgesAndNodes(product.variants),
    }));
}
