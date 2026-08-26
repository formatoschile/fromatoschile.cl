"use client";

import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react";

import type { Cart, CartProduct, ProductVariant } from "@/lib/shopify/types";

import type { UpdateType } from "./cartReducer";
import { cartReducer } from "./cartReducer";

export type { UpdateType } from "./cartReducer";

interface CartContextType {
  cart: Cart | undefined;
  // `false` until something (hydration, or an optimistic mutation) has
  // synced a cart at least once — lets `CartHydrator` (below) tell "no cart
  // yet" apart from "confirmed empty cart" without exposing internal state.
  hasSyncedCart: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => void;
  addCartItem: (variant: ProductVariant, product: CartProduct) => void;
  syncCart: (cart: Cart | undefined) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

/**
 * Holds the one shared optimistic cart state for the whole app. Every
 * consumer (header badge, cart drawer, add-to-cart buttons) reads from this
 * single `useOptimistic` instance, so an optimistic update triggered from
 * anywhere (e.g. a product page's "add to cart" button) is reflected
 * everywhere immediately (e.g. the header icon), instead of waiting for the
 * mutation's server round trip.
 *
 * Deliberately knows nothing about *how* the cart gets loaded — `children`
 * always renders immediately. Pair with `<CartHydrator>` (below), rendered
 * by the caller wherever it wants the initial fetch resolved; see
 * `app/layout.tsx` for the isolated-Suspense composition that keeps a
 * slow/cold cart fetch from blocking Navbar/page content.
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  // `null` means "no cart has synced yet, treat as empty"; `undefined` is a
  // legitimate synced state (no/empty cart).
  const [syncedCart, setSyncedCart] = useState<Cart | undefined | null>(null);

  const confirmedCart = syncedCart === null ? undefined : syncedCart;
  const [cart, updateOptimisticCart] = useOptimistic(
    confirmedCart,
    cartReducer
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const syncCart = useCallback(
    (nextCart: Cart | undefined) => setSyncedCart(nextCart),
    []
  );

  // Optimistic updates must run inside the same transition as the server
  // action that persists them (React useOptimistic contract).
  const updateCartItem = useCallback(
    (merchandiseId: string, updateType: UpdateType) => {
      updateOptimisticCart({
        type: "UPDATE_ITEM",
        payload: { merchandiseId, updateType },
      });
    },
    [updateOptimisticCart]
  );

  const addCartItem = useCallback(
    (variant: ProductVariant, product: CartProduct) => {
      updateOptimisticCart({
        type: "ADD_ITEM",
        payload: { variant, product },
      });
      setIsCartOpen(true);
    },
    [updateOptimisticCart]
  );

  const hasSyncedCart = syncedCart !== null;

  const value = useMemo(
    () => ({
      cart,
      hasSyncedCart,
      isCartOpen,
      openCart,
      closeCart,
      updateCartItem,
      addCartItem,
      syncCart,
    }),
    [
      cart,
      hasSyncedCart,
      isCartOpen,
      openCart,
      closeCart,
      updateCartItem,
      addCartItem,
      syncCart,
    ]
  );

  return <CartContext value={value}>{children}</CartContext>;
};

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
export function CartHydrator({
  cartPromise,
}: {
  cartPromise: Promise<Cart | undefined>;
}) {
  const initialCart = use(cartPromise);
  const { hasSyncedCart, syncCart } = useCart();

  useEffect(() => {
    if (!hasSyncedCart) {
      syncCart(initialCart);
    }
  }, [hasSyncedCart, initialCart, syncCart]);

  return null;
}

export function useCart() {
  const context = use(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
