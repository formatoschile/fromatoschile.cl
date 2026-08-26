"use client";

import { useTransition } from "react";

import type { Cart } from "@/lib/shopify/types";

import { useCart } from "./CartContext";

interface UseCartMutationResult {
  isPending: boolean;
  runMutation: (
    applyOptimisticUpdate: () => void,
    performAction: () => Promise<Cart | string | undefined>
  ) => void;
}

/**
 * Shared optimistic-mutation pattern for cart buttons (add/remove/edit
 * quantity): apply the optimistic update, run the server action inside the
 * same transition, then sync the confirmed cart once it settles.
 */
export function useCartMutation(): UseCartMutationResult {
  const { syncCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const runMutation: UseCartMutationResult["runMutation"] = (
    applyOptimisticUpdate,
    performAction
  ) => {
    startTransition(async () => {
      applyOptimisticUpdate();
      const result = await performAction();
      if (result && typeof result !== "string") {
        syncCart(result);
      }
    });
  };

  return { isPending, runMutation };
}
