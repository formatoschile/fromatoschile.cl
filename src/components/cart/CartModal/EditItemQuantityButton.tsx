"use client";

import React, { useTransition } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

import { updateItemQuantity } from "@/components/cart/actions";
import type { UpdateType } from "@/components/cart/CartContext";
import { useCart } from "@/components/cart/CartContext";
import type { CartItem } from "@/lib/shopify/types";
import { classNames } from "@/lib/utils/classNames";

interface SubmitButtonProps {
  type: "plus" | "minus";
  isPending: boolean;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  type,
  isPending,
  onClick,
}) => {
  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={type === "plus" ? "Aumentar cantidad" : "Reducir cantidad"}
      className={classNames(
        "cursor-pointer ease flex h-full w-9 flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
        {
          "ml-auto": type === "minus",
          "cursor-wait opacity-60": isPending,
        }
      )}
      onClick={onClick}
    >
      {type === "plus" ? (
        <PlusIcon className="h-4 w-4" />
      ) : (
        <MinusIcon className="h-4 w-4" />
      )}
    </button>
  );
};

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
  const { syncCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const payload = {
    lineId: item.id,
    merchandiseId: item.merchandise.id,
    quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
  };

  const handleClick = () => {
    startTransition(async () => {
      optimisticUpdate(payload.merchandiseId, type);
      const result = await updateItemQuantity(null, payload);
      if (result && typeof result !== "string") {
        syncCart(result);
      }
    });
  };

  return (
    <SubmitButton type={type} isPending={isPending} onClick={handleClick} />
  );
};
