"use client";

import React, {
  createContext,
  use,
  useCallback,
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
  // `true` while an optimistic mutation's server action is still in flight —
  // the Shopify cart may not include that change yet.
  hasPendingCartUpdate: boolean;
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
  // With no pending optimistic actions, `useOptimistic` passes the confirmed
  // state through by reference.
  const hasPendingCartUpdate = cart !== confirmedCart;

  const value = useMemo(
    () => ({
      cart,
      hasSyncedCart,
      hasPendingCartUpdate,
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
      hasPendingCartUpdate,
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

export function useCart() {
  const context = use(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
