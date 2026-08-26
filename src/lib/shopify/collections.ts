import { cacheLife, cacheTag } from "next/cache";

import { TAGS } from "@/lib/utils/constants";

import { shopifyFetch } from "./client";
import { fetchAllPages } from "./pagination";
import { getCollectionQuery, getCollectionsQuery } from "./queries/collection";
import {
  removeEdgesAndNodes,
  reshapeCollection,
  reshapeCollections,
} from "./reshape";
import type {
  Collection,
  ShopifyCollectionOperation,
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
