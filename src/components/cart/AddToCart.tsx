"use client";

import React from "react";

import { useProduct } from "@/components/product/ProductContext";
import type { Product } from "@/lib/shopify/types";
import { getSelectedVariant } from "@/lib/utils/product";

import { addItem } from "./actions";
import { AddToCartButton } from "./AddToCartButton";
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
    <AddToCartButton
      availableForSale={availableForSale}
      isPending={isPending}
      selectedVariantId={selectedVariantId}
      onClick={handleAddToCart}
    />
  );
};
