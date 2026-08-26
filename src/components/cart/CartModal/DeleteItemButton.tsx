"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import type { CartItem } from "@/lib/shopify/types";

import { removeItem } from "../actions";
import type { UpdateType } from "../CartContext";
import { useCartMutation } from "../useCartMutation";

interface DeleteItemButtonProps {
  item: CartItem;
  optimisticUpdate: (merchandiseId: string, updateType: UpdateType) => void;
}

export const DeleteItemButton: React.FC<DeleteItemButtonProps> = ({
  item,
  optimisticUpdate,
}) => {
  const { isPending, runMutation } = useCartMutation();
  const merchandiseId = item.merchandise.id;

  const handleClick = () => {
    runMutation(
      () => optimisticUpdate(merchandiseId, "delete"),
      () => removeItem(null, { lineId: item.id, merchandiseId })
    );
  };

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Eliminar del carrito"
      onClick={handleClick}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-500 disabled:cursor-wait disabled:opacity-60"
    >
      <XMarkIcon className="mx-px h-4 w-4 text-white" />
    </button>
  );
};
