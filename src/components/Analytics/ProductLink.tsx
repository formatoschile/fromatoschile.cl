"use client";

import Link from "next/link";

import { ANALYTICS_EVENTS, toEcommerce, trackEvent } from "@/lib/analytics";
import type { AnalyticsItem, AnalyticsLocation } from "@/lib/analytics";

interface ProductLinkProps extends Omit<
  React.ComponentProps<typeof Link>,
  "href" | "onClick"
> {
  handle: string;
  /** Built with `toAnalyticsItem`, including `item_list_name` and `index`. */
  item: AnalyticsItem;
  /** The kind of card the link sits in. */
  location: AnalyticsLocation;
}

/**
 * A link to a product page that reports `select_item` when clicked. Use it
 * for every product card in a list, so GA4 can tell which list sold.
 */
export const ProductLink: React.FC<ProductLinkProps> = ({
  handle,
  item,
  location,
  ...linkProps
}) => {
  const handleClick = () => {
    trackEvent({
      event: ANALYTICS_EVENTS.selectItem,
      labels: { location },
      ecommerce: toEcommerce({ items: [item], listName: item.item_list_name }),
    });
  };

  return (
    <Link {...linkProps} href={`/product/${handle}`} onClick={handleClick} />
  );
};
