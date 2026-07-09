"use client";

import { useTransition } from "react";

import { buyNow } from "@/components/cart/actions";
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    startTransition(async () => {
      await buyNow(null, variantId);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || !variantId}
      aria-label="Comprar ahora"
      className={classNames(
        "cursor-pointer transition-colors disabled:cursor-wait disabled:opacity-60",
        className
      )}
    >
      {isPending ? "Redirigiendo…" : children}
    </button>
  );
};
