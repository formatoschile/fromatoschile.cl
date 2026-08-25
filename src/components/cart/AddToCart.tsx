"use client";

import React, { useTransition } from "react";

import { useProduct } from "@/components/product/ProductContext";
import { Product, ProductVariant } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

import { addItem } from "./actions";
import { useCart } from "./CartContext";

interface AddToCartProps {
  product: Product;
}

export const AddToCart: React.FC<AddToCartProps> = ({ product }) => {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [isPending, startTransition] = useTransition();

  const matchedVariant = variants.find((candidate: ProductVariant) =>
    candidate.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = matchedVariant?.id || defaultVariantId;
  const finalVariant = variants.find(
    (candidate) => candidate.id === selectedVariantId
  );

  const handleAddToCart = () => {
    if (!finalVariant) {
      return;
    }

    startTransition(async () => {
      addCartItem(finalVariant, product);
      await addItem(null, selectedVariantId);
    });
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

  if (!availableForSale) {
    return (
      <button disabled className={classNames(buttonClasses, disabledClasses)}>
        No disponible
      </button>
    );
  }

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

  return (
    <button
      type="button"
      aria-label="Agregar al carrito"
      disabled={isPending}
      onClick={onClick}
      className={classNames(buttonClasses, {
        "hover:bg-ink hover:text-white": !isPending,
        "cursor-wait opacity-60": isPending,
      })}
    >
      Agregar al carrito
    </button>
  );
};
