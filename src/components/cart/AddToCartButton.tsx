"use client";

import { useTransition } from "react";

import { addItem } from "@/components/cart/actions";
import { useCart } from "@/components/cart/CartContext";
import type { CartProduct, ProductVariant } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

interface AddToCartButtonProps {
  variant: ProductVariant;
  product: CartProduct;
  className?: string;
  children?: React.ReactNode;
  /** Called on click, before the cart drawer opens (e.g. close a modal). */
  onAdd?: () => void;
}

/**
 * Standalone add-to-cart button for listings/modals that have no
 * ProductProvider (unlike the product page's AddToCart). Adds the line
 * optimistically and opens the cart drawer. `useCart` suspends, so render
 * this inside a Suspense boundary.
 */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  variant,
  product,
  className,
  children = "Agregar al carrito",
  onAdd,
}) => {
  const { addCartItem, syncCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAdd?.();

    startTransition(async () => {
      addCartItem(variant, product);
      const result = await addItem(null, variant.id);
      if (typeof result !== "string") {
        syncCart(result);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || !variant.availableForSale}
      className={classNames(
        "cursor-pointer transition-colors disabled:cursor-wait disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
};
