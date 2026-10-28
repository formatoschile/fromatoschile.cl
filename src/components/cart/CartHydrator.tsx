"use client";

import { use, useEffect } from "react";

import type { Cart } from "@/lib/shopify/types";

import { useCart } from "./CartContext";

interface CartHydratorProps {
  cartPromise: Promise<Cart | undefined>;
}

/**
 * Resolves a server cart promise and feeds it into `CartProvider`'s state —
 * skipped if anything (an optimistic mutation) already synced a cart first,
 * so a slow initial fetch can't clobber a faster mutation's result once it
 * finally resolves. Renders no DOM; the caller wraps it in its own
 * `<Suspense fallback={null}>` so a slow/cold fetch suspends only this
 * component, never whatever else is rendered alongside it.
 *
 * The sync happens in an Effect, not during render: `syncCart` updates
 * state owned by the parent `CartProvider`, and React doesn't allow a
 * component to update a different component's state while rendering (only
 * its own, e.g. the "derive state from a changed prop" pattern) — doing so
 * throws "Cannot update a component while rendering a different component".
 * Since this component's own render is gated on `use(cartPromise)`, the
 * Effect fires as soon as the resolved value is available, whether that's
 * within the same SSR pass or a later streamed chunk — no extra delay.
 */
export const CartHydrator: React.FC<CartHydratorProps> = ({ cartPromise }) => {
  const initialCart = use(cartPromise);
  const { hasSyncedCart, syncCart } = useCart();

  useEffect(() => {
    if (!hasSyncedCart) {
      syncCart(initialCart);
    }
  }, [hasSyncedCart, initialCart, syncCart]);

  return null;
};
