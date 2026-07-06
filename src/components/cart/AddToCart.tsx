"use client";

import React, { useTransition } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

import { useProduct } from "@/components/product/ProductContext";
import { Product, ProductVariant } from "@/lib/shopify/types";

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

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()],
    ),
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  const handleAddToCart = () => {
    if (!finalVariant) {
      return;
    }

    addCartItem(finalVariant, product);

    startTransition(async () => {
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
    "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Aggiungi al carrello
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Aggiungi al carrello"
      disabled={isPending}
      onClick={onClick}
      className={clsx(buttonClasses, {
        "hover:opacity-90": !isPending,
        "cursor-wait opacity-60": isPending,
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Aggiungi al carrello
    </button>
  );
};
