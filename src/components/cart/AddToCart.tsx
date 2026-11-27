"use client";

import React from "react";

import { useProduct } from "@/components/product/ProductContext";
import {
  ANALYTICS_EVENTS,
  LOCATIONS,
  toAnalyticsItem,
  toEcommerce,
  trackEvent,
} from "@/lib/analytics";
import type { Product, ProductVariant } from "@/lib/shopify/types";
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

    runMutation({
      applyOptimisticUpdate: () => addCartItem(finalVariant, product),
      performAction: () => addItem(null, selectedVariantId),
      onSuccess: () => trackAddToCart({ product, variant: finalVariant }),
    });
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

function trackAddToCart({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant;
}): void {
  trackEvent({
    event: ANALYTICS_EVENTS.addToCart,
    labels: { location: LOCATIONS.productPage },
    ecommerce: toEcommerce({
      items: [toAnalyticsItem({ product, variant })],
      currency: variant.price.currencyCode,
    }),
  });
}
