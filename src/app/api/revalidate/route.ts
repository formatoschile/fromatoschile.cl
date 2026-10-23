import * as Sentry from "@sentry/nextjs";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/env";
import { hasAdminCredentials } from "@/lib/shopify/admin/client";
import { syncProductThumbnail } from "@/lib/shopify/admin/previewThumbnails";
import { TAGS } from "@/lib/utils/constants";

// Thumbnail rendering runs in `after()` and is bounded by this duration.
export const maxDuration = 120;

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
const thumbnailWebhooks = ["products/create", "products/update"];

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

  if (thumbnailWebhooks.includes(topic)) {
    scheduleThumbnailSync({ rawBody });
  }

  if (isPageUpdate) {
    revalidateTag(TAGS.pages, "seconds");
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}

/**
 * Regenerates the product's card thumbnail after responding, so Shopify's
 * webhook timeout never waits on PDF rendering. Our own thumbnail writes
 * trigger this webhook again; `syncProductThumbnail` skips those.
 */
function scheduleThumbnailSync({ rawBody }: { rawBody: string }): void {
  if (!hasAdminCredentials()) {
    return;
  }

  const productId = getProductGid({ rawBody });
  if (!productId) {
    return;
  }

  after(async () => {
    const result = await syncProductThumbnail({ productId });
    if (result.action === "failed") {
      Sentry.captureMessage("Preview thumbnail sync failed", {
        level: "error",
        tags: { action: "preview-thumbnail" },
        extra: { ...result },
      });
    }
  });
}

function getProductGid({ rawBody }: { rawBody: string }): string | null {
  try {
    const { admin_graphql_api_id: gid } = JSON.parse(rawBody) as {
      admin_graphql_api_id?: unknown;
    };
    return typeof gid === "string" && gid.startsWith("gid://shopify/Product/")
      ? gid
      : null;
  } catch {
    return null;
  }
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
