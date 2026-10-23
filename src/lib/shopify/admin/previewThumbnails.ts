import { renderPdfThumbnail } from "@/lib/pdf/renderPdfThumbnail";

import { adminFetch } from "./client";
import {
  fileDeleteMutation,
  metafieldsDeleteMutation,
  metafieldsSetMutation,
  productAddMediaMutation,
  productReorderMediaMutation,
  stagedUploadsCreateMutation,
} from "./mutations";
import { getThumbnailProductQuery, getThumbnailProductsQuery } from "./queries";

/**
 * Keeps each product's main image in sync with page 1 of its watermarked
 * preview PDF (`custom.previewPdf`), so listing cards can show the real
 * document. Shared by the products webhook, the daily cron and the backfill
 * script (`scripts/backfill-preview-thumbnails.ts`).
 *
 * - Thumbnails we create are recognised by their alt text (`THUMBNAIL_ALT`).
 * - An `$app` metafield records which PDF URL (incl. Shopify's `?v=` version)
 *   the thumbnail belongs to. It is claimed as pending *before* the image is
 *   attached and marked attached after, so the `products/update` webhooks our
 *   own writes trigger see a matching source and skip.
 * - The webhook path trusts that record; the sweep (cron/backfill) also
 *   verifies the image exists and retries claims left pending by a run that
 *   died, once they're older than `STALE_CLAIM_MS`.
 * - If two runs race, each keeps only the newest thumbnail (highest media
 *   id) and deletes are idempotent, so they converge on one image.
 */

export const THUMBNAIL_ALT = "Vista previa del documento";

const SOURCE_NAMESPACE = "$app";
const SOURCE_KEY = "preview_thumbnail_source";
const DEFAULT_CONCURRENCY = 3;
const UPLOAD_TIMEOUT_MS = 30_000;
// Longer than any run can take (webhook `maxDuration` is 120s).
const STALE_CLAIM_MS = 10 * 60_000;

export type ThumbnailSyncAction =
  | "generated"
  | "unchanged"
  | "removed"
  | "no-pdf"
  | "not-found"
  | "failed";

export interface ThumbnailSyncResult {
  handle: string;
  action: ThumbnailSyncAction;
  error?: string;
}

export interface ThumbnailSweepSummary {
  results: ThumbnailSyncResult[];
  counts: Record<ThumbnailSyncAction, number>;
  hasMore: boolean;
}

interface ThumbnailMedia {
  id: string;
  alt: string | null;
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
}

interface ThumbnailProduct {
  id: string;
  handle: string;
  previewPdf: { reference: { url?: string } | null } | null;
  thumbnailSource: { value: string; updatedAt: string } | null;
  media: { nodes: ThumbnailMedia[] };
}

interface ThumbnailProductsResponse {
  products: {
    nodes: ThumbnailProduct[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface ThumbnailSource {
  pdfUrl: string;
  isAttached: boolean;
  updatedAt: number;
}

interface UserError {
  field?: string[] | null;
  message: string;
  code?: string | null;
}

/**
 * Syncs a single product — used by the `products/*` webhook. Skips as soon as
 * the stored source matches the current PDF, which is what stops the
 * webhooks fired by our own writes from looping.
 */
export async function syncProductThumbnail({
  productId,
}: {
  productId: string;
}): Promise<ThumbnailSyncResult> {
  const { product } = await adminFetch<{ product: ThumbnailProduct | null }>({
    query: getThumbnailProductQuery,
    variables: { id: productId },
  });

  if (!product) {
    return { handle: productId, action: "not-found" };
  }

  return syncThumbnail({ product, isDryRun: false, isSweep: false });
}

/**
 * Walks the whole catalog and syncs every product — used by the backfill
 * script and the daily cron. Stops early (with `hasMore: true`) once
 * `deadline` passes or `maxGenerated` thumbnails have been made.
 */
export async function syncAllProductThumbnails({
  isDryRun = false,
  concurrency = DEFAULT_CONCURRENCY,
  maxGenerated = Number.POSITIVE_INFINITY,
  deadline = Number.POSITIVE_INFINITY,
  onResult,
}: {
  isDryRun?: boolean;
  concurrency?: number;
  maxGenerated?: number;
  deadline?: number;
  onResult?: (result: ThumbnailSyncResult) => void;
}): Promise<ThumbnailSweepSummary> {
  const results: ThumbnailSyncResult[] = [];
  let generatedCount = 0;
  let after: string | null = null;

  const isOutOfBudget = () =>
    generatedCount >= maxGenerated || Date.now() >= deadline;

  do {
    const { products }: ThumbnailProductsResponse =
      await adminFetch<ThumbnailProductsResponse>({
        query: getThumbnailProductsQuery,
        variables: { after },
      });

    const queue = [...products.nodes];
    const worker = async () => {
      for (let product = queue.shift(); product; product = queue.shift()) {
        if (isOutOfBudget()) {
          return;
        }

        const result = await syncThumbnail({
          product,
          isDryRun,
          isSweep: true,
        });
        if (result.action === "generated") {
          generatedCount++;
        }
        results.push(result);
        onResult?.(result);
      }
    };

    await Promise.all(Array.from({ length: concurrency }, worker));

    after = products.pageInfo.hasNextPage ? products.pageInfo.endCursor : null;

    if (after && isOutOfBudget()) {
      return summarize({ results, hasMore: true });
    }
  } while (after);

  return summarize({ results, hasMore: false });
}

async function syncThumbnail({
  product,
  isDryRun,
  isSweep,
}: {
  product: ThumbnailProduct;
  isDryRun: boolean;
  isSweep: boolean;
}): Promise<ThumbnailSyncResult> {
  const { handle } = product;

  try {
    const pdfUrl = product.previewPdf?.reference?.url ?? null;
    const ownMedia = getOwnMedia({ product });
    const source = parseSource({ product });

    if (!pdfUrl) {
      if (ownMedia.length === 0 && !source) {
        return { handle, action: "no-pdf" };
      }
      if (!isDryRun) {
        await deleteFiles({ fileIds: ownMedia.map((media) => media.id) });
        await deleteSource({ productId: product.id });
      }
      return { handle, action: "removed" };
    }

    if (isCurrent({ source, pdfUrl, ownMedia, isSweep })) {
      return { handle, action: "unchanged" };
    }

    if (isDryRun) {
      return { handle, action: "generated" };
    }

    const image = await renderPdfThumbnail({ pdfUrl });
    const resourceUrl = await uploadImage({
      filename: `${handle}-vista-previa.webp`,
      image,
    });

    // Claim the source first so the webhooks fired by the writes below skip.
    await setSource({ productId: product.id, pdfUrl, isAttached: false });

    try {
      await addMedia({ productId: product.id, resourceUrl });
    } catch (error) {
      await deleteSource({ productId: product.id });
      throw error;
    }

    // From here on the image exists, so a failure leaves the claim pending
    // for the sweep to retry rather than releasing it (which would make our
    // own webhooks regenerate immediately).
    await promoteNewestThumbnail({ productId: product.id });
    await setSource({ productId: product.id, pdfUrl, isAttached: true });

    return { handle, action: "generated" };
  } catch (error) {
    console.error(`Preview thumbnail sync failed for ${handle}:`, error);
    return {
      handle,
      action: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function isCurrent({
  source,
  pdfUrl,
  ownMedia,
  isSweep,
}: {
  source: ThumbnailSource | null;
  pdfUrl: string;
  ownMedia: ThumbnailMedia[];
  isSweep: boolean;
}): boolean {
  if (source?.pdfUrl !== pdfUrl) {
    return false;
  }

  // Webhook path: a matching claim — attached or still in flight — is enough.
  if (!isSweep) {
    return true;
  }

  if (!source.isAttached) {
    return Date.now() - source.updatedAt < STALE_CLAIM_MS;
  }

  return ownMedia.some((media) => media.status !== "FAILED");
}

/** Our thumbnails on the product, newest (highest media id) first. */
function getOwnMedia({
  product,
}: {
  product: ThumbnailProduct;
}): ThumbnailMedia[] {
  return product.media.nodes
    .filter((media) => media.alt === THUMBNAIL_ALT)
    .toSorted((a, b) => compareGids({ a: b.id, b: a.id }));
}

function compareGids({ a, b }: { a: string; b: string }): number {
  const idA = BigInt(a.slice(a.lastIndexOf("/") + 1));
  const idB = BigInt(b.slice(b.lastIndexOf("/") + 1));

  if (idA === idB) {
    return 0;
  }
  return idA < idB ? -1 : 1;
}

function parseSource({
  product,
}: {
  product: ThumbnailProduct;
}): ThumbnailSource | null {
  if (!product.thumbnailSource) {
    return null;
  }

  try {
    const { pdfUrl, isAttached } = JSON.parse(
      product.thumbnailSource.value
    ) as Partial<ThumbnailSource>;

    if (typeof pdfUrl !== "string") {
      return null;
    }

    return {
      pdfUrl,
      isAttached: isAttached === true,
      updatedAt: Date.parse(product.thumbnailSource.updatedAt),
    };
  } catch {
    return null;
  }
}

async function uploadImage({
  filename,
  image,
}: {
  filename: string;
  image: Buffer;
}): Promise<string> {
  const { stagedUploadsCreate } = await adminFetch<{
    stagedUploadsCreate: {
      stagedTargets: {
        url: string;
        resourceUrl: string;
        parameters: { name: string; value: string }[];
      }[];
      userErrors: UserError[];
    };
  }>({
    query: stagedUploadsCreateMutation,
    variables: {
      input: [
        {
          filename,
          mimeType: "image/webp",
          httpMethod: "POST",
          resource: "PRODUCT_IMAGE",
          fileSize: String(image.byteLength),
        },
      ],
    },
  });
  assertNoUserErrors({
    operation: "stagedUploadsCreate",
    userErrors: stagedUploadsCreate.userErrors,
  });

  const [target] = stagedUploadsCreate.stagedTargets;
  const form = new FormData();
  for (const { name, value } of target.parameters) {
    form.append(name, value);
  }
  form.append(
    "file",
    new Blob([new Uint8Array(image)], { type: "image/webp" }),
    filename
  );

  const response = await fetch(target.url, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `Staged upload failed (${response.status}): ${await response.text()}`
    );
  }

  return target.resourceUrl;
}

async function addMedia({
  productId,
  resourceUrl,
}: {
  productId: string;
  resourceUrl: string;
}): Promise<void> {
  const { productUpdate } = await adminFetch<{
    productUpdate: { userErrors: UserError[] };
  }>({
    query: productAddMediaMutation,
    variables: {
      id: productId,
      media: [
        {
          originalSource: resourceUrl,
          alt: THUMBNAIL_ALT,
          mediaContentType: "IMAGE",
        },
      ],
    },
  });
  assertNoUserErrors({
    operation: "productUpdate",
    userErrors: productUpdate.userErrors,
  });
}

/**
 * Makes the newest thumbnail of ours the product's main image and deletes
 * the older ones (including any that failed processing).
 */
async function promoteNewestThumbnail({
  productId,
}: {
  productId: string;
}): Promise<void> {
  const { product } = await adminFetch<{ product: ThumbnailProduct }>({
    query: getThumbnailProductQuery,
    variables: { id: productId },
  });
  const [newest, ...stale] = getOwnMedia({ product });

  if (!newest) {
    throw new Error("Uploaded thumbnail is missing from the product media.");
  }

  const { productReorderMedia } = await adminFetch<{
    productReorderMedia: { mediaUserErrors: UserError[] };
  }>({
    query: productReorderMediaMutation,
    variables: { id: productId, moves: [{ id: newest.id, newPosition: "0" }] },
  });
  assertNoUserErrors({
    operation: "productReorderMedia",
    userErrors: productReorderMedia.mediaUserErrors,
  });

  await deleteFiles({ fileIds: stale.map((media) => media.id) });
}

/** Idempotent: files already deleted (e.g. by a concurrent run) are fine. */
async function deleteFiles({ fileIds }: { fileIds: string[] }): Promise<void> {
  if (fileIds.length === 0) {
    return;
  }

  const { fileDelete } = await adminFetch<{
    fileDelete: { userErrors: UserError[] };
  }>({ query: fileDeleteMutation, variables: { fileIds } });
  assertNoUserErrors({
    operation: "fileDelete",
    userErrors: fileDelete.userErrors.filter(
      (error) => error.code !== "FILE_DOES_NOT_EXIST"
    ),
  });
}

async function setSource({
  productId,
  pdfUrl,
  isAttached,
}: {
  productId: string;
  pdfUrl: string;
  isAttached: boolean;
}): Promise<void> {
  const { metafieldsSet } = await adminFetch<{
    metafieldsSet: { userErrors: UserError[] };
  }>({
    query: metafieldsSetMutation,
    variables: {
      metafields: [
        {
          ownerId: productId,
          namespace: SOURCE_NAMESPACE,
          key: SOURCE_KEY,
          type: "json",
          value: JSON.stringify({ pdfUrl, isAttached }),
        },
      ],
    },
  });
  assertNoUserErrors({
    operation: "metafieldsSet",
    userErrors: metafieldsSet.userErrors,
  });
}

async function deleteSource({
  productId,
}: {
  productId: string;
}): Promise<void> {
  const { metafieldsDelete } = await adminFetch<{
    metafieldsDelete: { userErrors: UserError[] };
  }>({
    query: metafieldsDeleteMutation,
    variables: {
      metafields: [
        { ownerId: productId, namespace: SOURCE_NAMESPACE, key: SOURCE_KEY },
      ],
    },
  });
  assertNoUserErrors({
    operation: "metafieldsDelete",
    userErrors: metafieldsDelete.userErrors,
  });
}

function assertNoUserErrors({
  operation,
  userErrors,
}: {
  operation: string;
  userErrors: UserError[];
}): void {
  if (userErrors.length === 0) {
    return;
  }

  throw new Error(
    `${operation}: ${userErrors.map((error) => error.message).join("; ")}`
  );
}

function summarize({
  results,
  hasMore,
}: {
  results: ThumbnailSyncResult[];
  hasMore: boolean;
}): ThumbnailSweepSummary {
  const counts: Record<ThumbnailSyncAction, number> = {
    generated: 0,
    unchanged: 0,
    removed: 0,
    "no-pdf": 0,
    "not-found": 0,
    failed: 0,
  };
  for (const { action } of results) {
    counts[action]++;
  }

  return { results, counts, hasMore };
}
