import { cacheLife, cacheTag } from "next/cache";

import { HIDDEN_PRODUCT_TAG, TAGS } from "@/lib/utils/constants";

import { shopifyFetch } from "./client";
import { fetchAllPages } from "./pagination";
import { getProductQuery, getProductsQuery } from "./queries/product";
import { removeEdgesAndNodes, reshapeProduct } from "./reshape";
import type {
  Connection,
  Edge,
  Product,
  ProductCard,
  ShopifyProductCard,
  ShopifyProductOperation,
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

  return toProductCards(edges);
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

  return {
    products: toProductCards(edges),
    hasNextPage: pageInfo?.hasNextPage ?? false,
    endCursor: pageInfo?.endCursor ?? null,
  };
}

function toProductCards(edges: Edge<ShopifyProductCard>[]): ProductCard[] {
  return removeEdgesAndNodes({ edges } as Connection<ShopifyProductCard>)
    .filter((product) => !product.tags.includes(HIDDEN_PRODUCT_TAG))
    .map((product) => {
      const { collections, ...rest } = product;

      return {
        ...rest,
        variants: removeEdgesAndNodes(product.variants),
        collectionHandle: removeEdgesAndNodes(collections)[0]?.handle ?? null,
      };
    });
}
