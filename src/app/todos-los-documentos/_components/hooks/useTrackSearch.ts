"use client";

import { useEffect, useRef } from "react";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

/**
 * Reports `fc_search` once the results for a new search term have rendered.
 * `resultCount` is the first page of results (capped at the page size), so
 * 0 reliably means "nothing found". An emptied search box reports nothing,
 * and the same term is not reported twice in a row (emptying the box in
 * between makes it a new search).
 */
export function useTrackSearch({
  query,
  resultCount,
}: {
  query: string;
  resultCount: number;
}): void {
  const lastReportedRef = useRef<string | null>(null);

  useEffect(() => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      lastReportedRef.current = null;
      return;
    }
    if (searchTerm === lastReportedRef.current) return;

    lastReportedRef.current = searchTerm;
    trackEvent({
      event: ANALYTICS_EVENTS.search,
      labels: { search_term: searchTerm, search_results: resultCount },
    });
  }, [query, resultCount]);
}
