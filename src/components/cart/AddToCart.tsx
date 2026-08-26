"use client";

import React from "react";

import { useProduct } from "@/components/product/ProductContext";
import type { Product } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";
import { getSelectedVariant } from "@/lib/utils/product";

import { addItem } from "./actions";
import { useCart } from "./CartContext";
import { useCartMutation } from "./useCartMutation";

interface AddToCartProps {
  product: Product;
}

export const AddToCart: React.FC<AddToCartProps> = ({ product }) => {
  const { variants } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const { isPending, runMutation } = useCartMutation();

  const finalVariant = getSelectedVariant(variants, state);
  const selectedVariantId = finalVariant?.id;
  const availableForSale = finalVariant?.availableForSale ?? false;

  const handleAddToCart = () => {
    if (!finalVariant) {
      return;
    }

    runMutation(
      () => addCartItem(finalVariant, product),
      () => addItem(null, selectedVariantId)
    );
  };

  return (
    <SubmitButton
      availableForSale={availableForSale}
      isPending={isPending}
      selectedVariantId={selectedVariantId}
      onClick={handleAddToCart}
    />
  );
};

interface SubmitButtonProps {
  availableForSale: boolean;
  isPending: boolean;
  selectedVariantId: string | undefined;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  availableForSale,
  isPending,
  selectedVariantId,
  onClick,
}) => {
  const buttonClasses =
    "w-full border border-ink bg-white py-4 text-sm font-medium tracking-widest text-ink uppercase transition-colors";
  const disabledClasses =
    "cursor-not-allowed opacity-60 hover:bg-white hover:text-ink";

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Selecciona una opción"
        disabled
        className={classNames(buttonClasses, disabledClasses)}
      >
        Agregar al carrito
      </button>
    );
  }

  if (!availableForSale) {
    return (
      <button disabled className={classNames(buttonClasses, disabledClasses)}>
        No disponible
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Agregar al carrito"
      disabled={isPending}
      onClick={onClick}
      className={classNames(buttonClasses, {
        "cursor-pointer hover:bg-ink hover:text-white": !isPending,
        "cursor-wait opacity-60": isPending,
      })}
    >
      Agregar al carrito
    </button>
  );
};
