import { cacheLife, cacheTag } from "next/cache";

import { TAGS } from "@/lib/utils/constants";

import { getPageQuery, getPagesQuery } from "./queries/page";
import { shopifyFetch } from "./client";
import { removeEdgesAndNodes } from "./reshape";
import type {
  Page,
  ShopifyPageOperation,
  ShopifyPagesOperation,
} from "./types";

export async function getPage(handle: string): Promise<Page> {
  "use cache";
  cacheTag(TAGS.pages);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  "use cache";
  cacheTag(TAGS.pages);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
  });

  return removeEdgesAndNodes(res.body.data.pages);
}
