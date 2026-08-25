import { cacheLife, cacheTag } from "next/cache";

import { TAGS } from "@/lib/utils/constants";

import { shopifyFetch } from "./client";
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

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
    },
  });

  if (!res.body.data.collectionByHandle) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collectionByHandle.products)
  );
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery,
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
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
