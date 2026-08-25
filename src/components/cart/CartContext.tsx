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

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // `null` means "no mutation has settled yet, fall back to the streamed
  // promise"; `undefined` is a legitimate synced state (no/empty cart).
  syncedCart: Cart | undefined | null;
  syncCart: (cart: Cart | undefined) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}

/**
 * Holds the server cart promise and the cart-drawer open state. The promise
 * is resolved with `use()` inside `useCart`, so consumers must render inside
 * a Suspense boundary.
 */
export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  cartPromise,
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [syncedCart, setSyncedCart] = useState<Cart | undefined | null>(null);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const syncCart = useCallback((cart: Cart | undefined) => {
    setSyncedCart(cart);
  }, []);

  const value = useMemo(
    () => ({
      cartPromise,
      isCartOpen,
      openCart,
      closeCart,
      syncedCart,
      syncCart,
    }),
    [cartPromise, closeCart, isCartOpen, openCart, syncedCart, syncCart]
  );

  return <CartContext value={value}>{children}</CartContext>;
};

export function useCart() {
  const context = use(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  // Falls back to the server-streamed promise until some mutation's syncCart
  // call (shared via context, so every useCart() consumer agrees) settles.
  const initialCart = use(context.cartPromise);
  const confirmedCart =
    context.syncedCart === null ? initialCart : context.syncedCart;
  const [cart, updateOptimisticCart] = useOptimistic(
    confirmedCart,
    cartReducer
  );

  // Optimistic updates must run inside the same transition as the server
  // action that persists them (React useOptimistic contract).
  const updateCartItem = (merchandiseId: string, updateType: UpdateType) => {
    updateOptimisticCart({
      type: "UPDATE_ITEM",
      payload: { merchandiseId, updateType },
    });
  };

  const addCartItem = (variant: ProductVariant, product: CartProduct) => {
    updateOptimisticCart({ type: "ADD_ITEM", payload: { variant, product } });
    context.openCart();
  };

  return {
    cart,
    isCartOpen: context.isCartOpen,
    openCart: context.openCart,
    closeCart: context.closeCart,
    updateCartItem,
    addCartItem,
    syncCart: context.syncCart,
  };
}
