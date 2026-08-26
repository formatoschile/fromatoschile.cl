"use client";

import { useTransition } from "react";

import { useToast } from "@/components/ui/Toast/ToastContext";
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
 * same transition, then sync the confirmed cart once it settles. If the
 * action fails, `syncCart` is skipped so `useOptimistic` reverts to the last
 * confirmed cart on its own, and the error is surfaced as a toast.
 */
export function useCartMutation(): UseCartMutationResult {
  const { syncCart } = useCart();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const runMutation: UseCartMutationResult["runMutation"] = (
    applyOptimisticUpdate,
    performAction
  ) => {
    startTransition(async () => {
      applyOptimisticUpdate();
      const result = await performAction();
      if (!result) {
        return;
      }
      if (typeof result === "string") {
        showToast({ message: result, variant: "error" });
        return;
      }
      syncCart(result);
    });
  };

  return { isPending, runMutation };
}
