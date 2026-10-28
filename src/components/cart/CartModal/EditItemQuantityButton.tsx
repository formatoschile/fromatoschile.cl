"use client";

import React from "react";

import { updateItemQuantity } from "@/components/cart/actions";
import type { UpdateType } from "@/components/cart/CartContext";
import { useCartMutation } from "@/components/cart/useCartMutation";
import type { CartItem } from "@/lib/shopify/types";

import { QuantityButton } from "./QuantityButton";

interface EditItemQuantityButtonProps {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: (merchandiseId: string, updateType: UpdateType) => void;
}

export const EditItemQuantityButton: React.FC<EditItemQuantityButtonProps> = ({
  item,
  type,
  optimisticUpdate,
}) => {
  const { isPending, runMutation } = useCartMutation();
  const payload = {
    lineId: item.id,
    merchandiseId: item.merchandise.id,
    quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
  };

  const handleClick = () => {
    runMutation(
      () => optimisticUpdate(payload.merchandiseId, type),
      () => updateItemQuantity(null, payload)
    );
  };

  return (
    <QuantityButton type={type} isPending={isPending} onClick={handleClick} />
  );
};
