"use client";

import React from "react";

import { BuyButton } from "@/components/cart/BuyButton";
import { useProduct } from "@/components/product/ProductContext";
import { Product } from "@/lib/shopify/types";
import { getSelectedVariant } from "@/lib/utils/product";

interface BuyNowButtonProps {
  product: Product;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Resolves the variant from the currently selected options (same logic as
 * AddToCart) before handing it to the presentational BuyButton, so "Compra"
 * checks out the variant the customer actually picked.
 */
export const BuyNowButton: React.FC<BuyNowButtonProps> = ({
  product,
  className,
  children,
}) => {
  const { variants } = product;
  const { state } = useProduct();

  const selectedVariant = getSelectedVariant(variants, state);
  const variantId =
    selectedVariant?.availableForSale && selectedVariant.id
      ? selectedVariant.id
      : "";

  return (
    <BuyButton variantId={variantId} className={className}>
      {children}
    </BuyButton>
  );
};
