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

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const value = useMemo(
    () => ({ cartPromise, isCartOpen, openCart, closeCart }),
    [cartPromise, closeCart, isCartOpen, openCart]
  );

  return <CartContext value={value}>{children}</CartContext>;
};

export function useCart() {
  const context = use(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const initialCart = use(context.cartPromise);
  const [cart, updateOptimisticCart] = useOptimistic(initialCart, cartReducer);

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
  };
}
