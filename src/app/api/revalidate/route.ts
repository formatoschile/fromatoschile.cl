import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env";
import { TAGS } from "@/lib/utils/constants";

const collectionWebhooks = [
  "collections/create",
  "collections/delete",
  "collections/update",
];
const productWebhooks = [
  "products/create",
  "products/delete",
  "products/update",
];
const pageWebhooks = ["pages/create", "pages/delete", "pages/update"];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);
  const isPageUpdate = pageWebhooks.includes(topic);

  if (!secret || secret !== env.SHOPIFY_REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate && !isPageUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, "seconds");
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, "seconds");
  }

  if (isPageUpdate) {
    revalidateTag(TAGS.pages, "seconds");
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
