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
  cartPromise: Promise<Cart | undefined>;
}

/**
 * Resolves the server cart promise and holds the one shared optimistic cart
 * state for the whole app. Every consumer (header badge, cart drawer,
 * add-to-cart buttons) reads from this single `useOptimistic` instance, so
 * an optimistic update triggered from anywhere (e.g. a product page's "add
 * to cart" button) is reflected everywhere immediately (e.g. the header
 * icon), instead of waiting for the mutation's server round trip. Must
 * render inside a Suspense boundary, since it calls `use()` on the cart
 * promise.
 */
export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  cartPromise,
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  // `null` means "no mutation has settled yet, fall back to the streamed
  // promise"; `undefined` is a legitimate synced state (no/empty cart).
  const [syncedCart, setSyncedCart] = useState<Cart | undefined | null>(null);

  const initialCart = use(cartPromise);
  const confirmedCart = syncedCart === null ? initialCart : syncedCart;
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

  const value = useMemo(
    () => ({
      cart,
      isCartOpen,
      openCart,
      closeCart,
      updateCartItem,
      addCartItem,
      syncCart,
    }),
    [
      cart,
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
