"use client";

import { useEffect, useRef } from "react";

import { ANALYTICS_EVENTS, toEcommerce, trackEvent } from "@/lib/analytics";
import type { AnalyticsItem } from "@/lib/analytics";

interface TrackViewItemProps {
  item: AnalyticsItem;
}

/** Renders nothing; reports `view_item` once per product page view. */
export const TrackViewItem: React.FC<TrackViewItemProps> = ({ item }) => {
  const lastReportedIdRef = useRef<string | null>(null);

  // Routes stay mounted in <Activity> (`cacheComponents`): hiding a route
  // runs cleanups, showing it again re-runs effects with refs intact. Forget
  // what was reported on hide, so coming back counts as a new view. (Costs a
  // duplicate push under Strict Mode, in development only.)
  useEffect(
    () => () => {
      lastReportedIdRef.current = null;
    },
    []
  );

  useEffect(() => {
    // Re-renders with an equal item must not report again.
    if (item.item_id === lastReportedIdRef.current) return;

    lastReportedIdRef.current = item.item_id;
    trackEvent({
      event: ANALYTICS_EVENTS.viewItem,
      ecommerce: toEcommerce({ items: [item] }),
    });
  }, [item]);

  return null;
};
