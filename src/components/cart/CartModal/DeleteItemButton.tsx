"use client";

import React, { useTransition } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import type { CartItem } from "@/lib/shopify/types";

import { removeItem } from "../actions";

interface DeleteItemButtonProps {
  item: CartItem;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optimisticUpdate: any;
}

export const DeleteItemButton: React.FC<DeleteItemButtonProps> = ({
  item,
  optimisticUpdate,
}) => {
  const [isPending, startTransition] = useTransition();
  const merchandiseId = item.merchandise.id;

  const handleClick = () => {
    optimisticUpdate(merchandiseId, "delete");

    startTransition(async () => {
      await removeItem(null, merchandiseId);
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Remove cart item"
      onClick={handleClick}
      className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500 disabled:cursor-wait disabled:opacity-60"
    >
      <XMarkIcon className="mx-px h-4 w-4 text-white dark:text-black" />
    </button>
  );
};
