"use client";

import React from "react";

import { BuyButton } from "@/components/cart/BuyButton";
import { useProduct } from "@/components/product/ProductContext";
import { Product, ProductVariant } from "@/lib/shopify/types";

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

  const matchedVariant = variants.find((candidate: ProductVariant) =>
    candidate.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const variantId = matchedVariant?.id || defaultVariantId || "";

  return (
    <BuyButton variantId={variantId} className={className}>
      {children}
    </BuyButton>
  );
};
