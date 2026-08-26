import { cacheLife, cacheTag } from "next/cache";

import { TAGS } from "@/lib/utils/constants";

import { shopifyFetch } from "./client";
import { fetchAllPages } from "./pagination";
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import {
  removeEdgesAndNodes,
  reshapeCollection,
  reshapeCollections,
  reshapeProducts,
} from "./reshape";
import type {
  Collection,
  Product,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
} from "./types";

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const edges = await fetchAllPages((after) =>
    shopifyFetch<ShopifyCollectionProductsOperation>({
      query: getCollectionProductsQuery,
      variables: {
        handle: collection,
        reverse,
        sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
        after,
      },
    }).then((res) => {
      if (!res.body.data.collectionByHandle) {
        if (!after) {
          console.log(`No collection found for \`${collection}\``);
        }
        return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
      }
      return res.body.data.collectionByHandle.products;
    })
  );

  return reshapeProducts(removeEdgesAndNodes({ edges }));
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const edges = await fetchAllPages((after) =>
    shopifyFetch<ShopifyCollectionsOperation>({
      query: getCollectionsQuery,
      variables: { after },
    }).then((res) => res.body?.data?.collections ?? { edges: [] })
  );
  const shopifyCollections = removeEdgesAndNodes({ edges });
  const collections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/todos-los-documentos",
      updatedAt: new Date().toISOString(),
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith("hidden")
    ),
  ];

  return collections;
}
