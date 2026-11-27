"use client";

import { useEffect, useRef } from "react";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

interface ReportedPreview {
  url: string;
  isOpenReported: boolean;
  pages: Set<number>;
}

/**
 * Reports how far a visitor reads the watermarked preview:
 * - `fc_preview_open` once the document has loaded (`numPages` > 0);
 * - `fc_preview_page` the first time each page from 2 onwards is shown.
 * Page 1 is not reported separately: it is what "open" already means.
 * A different `url` (another product) starts over.
 */
export function useTrackPreview({
  url,
  numPages,
  currentPage,
}: {
  url: string;
  numPages: number;
  currentPage: number;
}): void {
  const reportedRef = useRef<ReportedPreview | null>(null);

  // Routes stay mounted in <Activity> (`cacheComponents`): hiding a route
  // runs cleanups, showing it again re-runs effects with refs intact. Forget
  // what was reported on hide, so coming back counts as a new view. (Costs a
  // duplicate push under Strict Mode, in development only.)
  useEffect(
    () => () => {
      reportedRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!numPages) return;

    if (reportedRef.current?.url !== url) {
      reportedRef.current = { url, isOpenReported: false, pages: new Set() };
    }
    const reported = reportedRef.current;

    if (!reported.isOpenReported) {
      reported.isOpenReported = true;
      trackEvent({ event: ANALYTICS_EVENTS.previewOpen });
    }

    if (currentPage < 2 || reported.pages.has(currentPage)) return;

    reported.pages.add(currentPage);
    trackEvent({
      event: ANALYTICS_EVENTS.previewPage,
      labels: { preview_page: currentPage },
    });
  }, [url, numPages, currentPage]);
}
