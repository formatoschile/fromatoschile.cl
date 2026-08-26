import * as Sentry from "@sentry/nextjs";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

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
  const rawBody = await req.text();
  const requestHeaders = await headers();
  const signature = requestHeaders.get("x-shopify-hmac-sha256");

  if (!signature || !isValidSignature(rawBody, signature)) {
    console.error("Invalid revalidation webhook signature.");
    Sentry.captureMessage("Invalid revalidation webhook signature", {
      level: "warning",
      tags: { action: "revalidate" },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = requestHeaders.get("x-shopify-topic") || "unknown";
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);
  const isPageUpdate = pageWebhooks.includes(topic);

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

function isValidSignature(rawBody: string, signature: string): boolean {
  const digest = createHmac("sha256", env.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  const digestBuffer = Buffer.from(digest);
  const signatureBuffer = Buffer.from(signature);

  return (
    digestBuffer.length === signatureBuffer.length &&
    timingSafeEqual(digestBuffer, signatureBuffer)
  );
}
