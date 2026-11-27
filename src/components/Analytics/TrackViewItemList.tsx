"use client";

import type { AnalyticsItem, ItemListName } from "@/lib/analytics";

import { useTrackItemList } from "./useTrackItemList";

interface TrackViewItemListProps {
  listName: ItemListName;
  items: AnalyticsItem[];
}

/**
 * Renders nothing; reports `view_item_list` for a list rendered by a server
 * component. Build `items` on the server with `toAnalyticsItem`.
 */
export const TrackViewItemList: React.FC<TrackViewItemListProps> = ({
  listName,
  items,
}) => {
  useTrackItemList({ listName, items });

  return null;
};
