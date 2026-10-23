#!/usr/bin/env bun

/**
 * Generates card thumbnails (page 1 of the watermarked preview PDF) for every
 * product that doesn't have a current one. Safe to stop and re-run: products
 * whose thumbnail already matches their PDF are skipped.
 *
 * Needs the app's usual env vars (validated by `src/env.ts`) plus
 * SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET in `.env` — Bun
 * loads it automatically.
 *
 * Usage:
 *   bun scripts/backfill-preview-thumbnails.ts --dry-run    # report only
 *   bun scripts/backfill-preview-thumbnails.ts --limit 5    # trial batch
 *   bun scripts/backfill-preview-thumbnails.ts              # everything
 */

import { syncAllProductThumbnails } from "@/lib/shopify/admin/previewThumbnails";
import type { ThumbnailSyncResult } from "@/lib/shopify/admin/previewThumbnails";

const IS_DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = parseLimit();

const ACTION_LABELS: Record<ThumbnailSyncResult["action"], string> = {
  generated: IS_DRY_RUN ? "would generate" : "generated",
  unchanged: "up to date",
  removed: IS_DRY_RUN ? "would remove" : "removed (no PDF)",
  "no-pdf": "no preview PDF",
  "not-found": "not found",
  failed: "FAILED",
};

console.log(
  `Backfilling preview thumbnails${IS_DRY_RUN ? " (dry run)" : ""}${
    LIMIT ? `, at most ${LIMIT}` : ""
  }…\n`
);

const { counts, hasMore, results } = await syncAllProductThumbnails({
  isDryRun: IS_DRY_RUN,
  maxGenerated: LIMIT ?? Number.POSITIVE_INFINITY,
  // One at a time for a limited trial, so the limit is exact.
  concurrency: LIMIT ? 1 : undefined,
  onResult: logResult,
});

console.log("\nSummary:");
for (const [action, count] of Object.entries(counts)) {
  console.log(
    `  ${ACTION_LABELS[action as ThumbnailSyncResult["action"]]}: ${count}`
  );
}
if (hasMore) {
  console.log("\nStopped at the limit — run again to continue.");
}

const failures = results.filter((result) => result.action === "failed");
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const { handle, error } of failures) {
    console.log(`  ${handle}: ${error}`);
  }
  process.exit(1);
}

function logResult({ handle, action }: ThumbnailSyncResult): void {
  if (action === "unchanged" || action === "no-pdf" || action === "not-found") {
    return;
  }
  console.log(`  ${ACTION_LABELS[action]}: ${handle}`);
}

function parseLimit(): number | undefined {
  const index = process.argv.indexOf("--limit");
  if (index === -1) {
    return undefined;
  }

  const value = Number(process.argv[index + 1]);
  if (!Number.isInteger(value) || value < 1) {
    console.error("--limit expects a positive integer");
    process.exit(1);
  }
  return value;
}
