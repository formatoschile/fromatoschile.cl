"use client";

import React, { useTransition } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import type { CartItem } from "@/lib/shopify/types";

import { removeItem } from "../actions";
import type { UpdateType } from "../CartContext";

interface DeleteItemButtonProps {
  item: CartItem;
  optimisticUpdate: (merchandiseId: string, updateType: UpdateType) => void;
}

export const DeleteItemButton: React.FC<DeleteItemButtonProps> = ({
  item,
  optimisticUpdate,
}) => {
  const [isPending, startTransition] = useTransition();
  const merchandiseId = item.merchandise.id;

  const handleClick = () => {
    startTransition(async () => {
      optimisticUpdate(merchandiseId, "delete");
      await removeItem(null, { lineId: item.id, merchandiseId });
    });
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
