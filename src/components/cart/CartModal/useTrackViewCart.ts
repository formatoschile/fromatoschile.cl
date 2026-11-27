"use client";

import { useEffect, useRef } from "react";

import {
  ANALYTICS_EVENTS,
  cartItemToAnalyticsItem,
  LOCATIONS,
  toEcommerce,
  trackEvent,
} from "@/lib/analytics";
import type { Cart } from "@/lib/shopify/types";

/**
 * Reports `view_cart` once each time the cart panel opens with something in
 * it. Opening it again later is a new view; changes while it is open are not.
 */
export function useTrackViewCart({
  isCartOpen,
  cart,
}: {
  isCartOpen: boolean;
  cart: Cart | undefined;
}): void {
  const isReportedRef = useRef(false);

  useEffect(() => {
    if (!isCartOpen) {
      isReportedRef.current = false;
      return;
    }
    if (isReportedRef.current || !cart?.lines.length) return;

    isReportedRef.current = true;
    trackEvent({
      event: ANALYTICS_EVENTS.viewCart,
      labels: { location: LOCATIONS.cart },
      ecommerce: toEcommerce({
        items: cart.lines.map((item) => cartItemToAnalyticsItem({ item })),
        currency: cart.cost.totalAmount.currencyCode,
      }),
    });
  }, [isCartOpen, cart]);
}
