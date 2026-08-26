"use client";

import { useTransition } from "react";
import { ScaleIcon } from "@heroicons/react/24/outline";

import { buyNow } from "@/components/cart/actions";
import { useToast } from "@/components/ui/Toast/ToastContext";
import { classNames } from "@/lib/utils/classNames";

interface BuyButtonProps {
  variantId: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Direct "buy now" button — creates a standalone cart for the given variant and
 * redirects straight to Shopify checkout (no cart step). Stops click propagation
 * so it can sit inside a clickable card without also triggering the card.
 */
export const BuyButton: React.FC<BuyButtonProps> = ({
  variantId,
  className,
  children = "Compra",
}) => {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    startTransition(async () => {
      // `buyNow` redirects on success (throws internally) and only ever
      // returns a value when checkout creation failed.
      const errorMessage = await buyNow(null, variantId);
      if (errorMessage) {
        showToast({ message: errorMessage, variant: "error" });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || !variantId}
      aria-label={isPending ? "Redirigiendo a pago" : "Comprar ahora"}
      aria-busy={isPending}
      className={classNames(
        "relative cursor-pointer transition-colors disabled:cursor-wait disabled:opacity-60",
        className
      )}
    >
      <span className={classNames({ invisible: isPending })}>{children}</span>
      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <ScaleIcon className="animate-tilt h-5 w-5" />
        </span>
      )}
    </button>
  );
};
