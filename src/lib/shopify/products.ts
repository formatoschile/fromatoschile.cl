import { cacheLife, cacheTag } from "next/cache";

import { HIDDEN_PRODUCT_TAG, TAGS } from "@/lib/utils/constants";

import { shopifyFetch } from "./client";
import { fetchAllPages } from "./pagination";
import {
  getProductByIdQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
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
 *
 * Pass `first` to cap the result to a single page (e.g. a "related products"
 * widget that only needs a handful) — omit it to page through the full
 * result set (sitemap, catalog listings).
 */
export async function getProducts({
  query,
  reverse,
  sortKey,
  first,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  first?: number;
}): Promise<ProductCard[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const edges = first
    ? (
        await shopifyFetch<ShopifyProductsOperation>({
          query: getProductsQuery,
          variables: { query, reverse, sortKey, first },
        })
      ).body.data.products.edges
    : await fetchAllPages((after) =>
        shopifyFetch<ShopifyProductsOperation>({
          query: getProductsQuery,
          variables: {
            query,
            reverse,
            sortKey,
            after,
          },
        }).then((res) => res.body.data.products)
      );

  return removeEdgesAndNodes({ edges })
    .filter((product) => !product.tags.includes(HIDDEN_PRODUCT_TAG))
    .map((product) => ({
      ...product,
      variants: removeEdgesAndNodes(product.variants),
    }));
}

export type ProductsPage = {
  products: ProductCard[];
  hasNextPage: boolean;
  endCursor: string | null;
};

/**
 * A single bounded, cursor-paginated page of the catalog — the counterpart
 * to `getProducts` for catalog/search UIs that shouldn't fetch (and ship)
 * the entire product list to render one page of results.
 */
export async function getProductsPage({
  query,
  reverse,
  sortKey,
  first,
  after,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  first: number;
  after?: string;
}): Promise<ProductsPage> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: { query, reverse, sortKey, first, after },
  });

  const { edges, pageInfo } = res.body.data.products;

  const products = removeEdgesAndNodes({ edges })
    .filter((product) => !product.tags.includes(HIDDEN_PRODUCT_TAG))
    .map((product) => ({
      ...product,
      variants: removeEdgesAndNodes(product.variants),
    }));

  return {
    products,
    hasNextPage: pageInfo?.hasNextPage ?? false,
    endCursor: pageInfo?.endCursor ?? null,
  };
}
