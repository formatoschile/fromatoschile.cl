"use client";

import { useTransition } from "react";

import { useToast } from "@/components/ui/Toast/ToastContext";
import type { Cart } from "@/lib/shopify/types";

import { useCart } from "./CartContext";

interface CartMutation {
  applyOptimisticUpdate: () => void;
  performAction: () => Promise<Cart | string | undefined>;
  onSuccess?: (cart: Cart) => void;
}

interface UseCartMutationResult {
  isPending: boolean;
  runMutation: (mutation: CartMutation) => void;
}

/**
 * Shared optimistic-mutation pattern for cart buttons (add/remove/edit
 * quantity): apply the optimistic update, run the server action inside the
 * same transition, then sync the confirmed cart once it settles. If the
 * action fails, `syncCart` is skipped so `useOptimistic` reverts to the last
 * confirmed cart on its own, and the error is surfaced as a toast.
 * `onSuccess` runs only once the server confirmed the change — the place to
 * report analytics, so a failed add or remove is never counted.
 */
export function useCartMutation(): UseCartMutationResult {
  const { syncCart } = useCart();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const runMutation: UseCartMutationResult["runMutation"] = ({
    applyOptimisticUpdate,
    performAction,
    onSuccess,
  }) => {
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
      onSuccess?.(result);
    });
  };

  return { isPending, runMutation };
}
