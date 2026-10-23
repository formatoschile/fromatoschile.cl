import * as Sentry from "@sentry/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { env } from "@/env";
import { hasAdminCredentials } from "@/lib/shopify/admin/client";
import { syncAllProductThumbnails } from "@/lib/shopify/admin/previewThumbnails";

/**
 * Daily safety net for product preview thumbnails (see `vercel.json` crons):
 * catches anything a dropped webhook missed. Work that doesn't fit in one
 * run is picked up by the next one, since current products are skipped.
 */

export const maxDuration = 300;

// Leave headroom under `maxDuration` for the in-flight renders to finish.
const SWEEP_BUDGET_MS = 240_000;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!env.CRON_SECRET) {
    Sentry.captureMessage("CRON_SECRET is not set; thumbnail cron disabled", {
      level: "warning",
      tags: { action: "preview-thumbnail" },
    });
  }

  if (!isAuthorized({ header: req.headers.get("authorization") })) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Shopify Admin credentials are not configured" },
      { status: 503 }
    );
  }

  const { counts, hasMore, results } = await syncAllProductThumbnails({
    deadline: Date.now() + SWEEP_BUDGET_MS,
  });

  const failures = results.filter((result) => result.action === "failed");
  if (failures.length > 0) {
    Sentry.captureMessage("Preview thumbnail cron had failures", {
      level: "error",
      tags: { action: "preview-thumbnail" },
      extra: { failures },
    });
  }

  return NextResponse.json({ counts, hasMore, failures });
}

function isAuthorized({ header }: { header: string | null }): boolean {
  if (!env.CRON_SECRET || !header) {
    return false;
  }

  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const received = Buffer.from(header);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
