"use client";

import { useEffect, useRef } from "react";

import { ANALYTICS_EVENTS, toEcommerce, trackEvent } from "@/lib/analytics";
import type { AnalyticsItem, ItemListName } from "@/lib/analytics";

/**
 * Reports `view_item_list` for a rendered list of products, once per item.
 *
 * Lists that grow ("load more") only report the newly appended items; a new
 * `listKey` (another search or filter) starts the count again and reports
 * the whole new list. Also safe under Strict Mode's double effects.
 */
export function useTrackItemList({
  listName,
  listKey = "",
  items,
}: {
  listName: ItemListName;
  listKey?: string;
  items: AnalyticsItem[];
}): void {
  const reportedRef = useRef({ listKey, count: 0 });

  // Routes stay mounted in <Activity> (`cacheComponents`): hiding a route
  // runs cleanups, showing it again re-runs effects with refs intact. Forget
  // what was reported on hide, so coming back counts as a new view. (Costs a
  // duplicate push under Strict Mode, in development only.)
  useEffect(
    () => () => {
      reportedRef.current = { listKey: "", count: 0 };
    },
    []
  );

  useEffect(() => {
    if (reportedRef.current.listKey !== listKey) {
      reportedRef.current = { listKey, count: 0 };
    }

    const newItems = items.slice(reportedRef.current.count);
    if (!newItems.length) return;

    reportedRef.current.count = items.length;
    trackEvent({
      event: ANALYTICS_EVENTS.viewItemList,
      ecommerce: toEcommerce({ items: newItems, listName }),
    });
  }, [listName, listKey, items]);
}
