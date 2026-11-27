"use client";

import { useTransition } from "react";
import { ScaleIcon } from "@heroicons/react/24/outline";

import { buyNow } from "@/components/cart/actions";
import { useToast } from "@/components/ui/Toast/ToastContext";
import { ANALYTICS_EVENTS, CHECKOUT_ROUTES, trackEvent } from "@/lib/analytics";
import type { AnalyticsLocation } from "@/lib/analytics";
import { classNames } from "@/lib/utils/classNames";

interface BuyButtonProps {
  variantId: string;
  /** Where the button sits, reported with the checkout click. */
  location: AnalyticsLocation;
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
  location,
  className,
  children = "Compra",
}) => {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // A funnel step for GA4 only. Shopify reports the real InitiateCheckout
    // when checkout loads (tracking plan, section 2).
    trackEvent({
      event: ANALYTICS_EVENTS.checkoutClick,
      labels: { route: CHECKOUT_ROUTES.buyNow, location },
    });
    startTransition(async () => {
      // `buyNow` redirects on success (throws internally) and only ever
      // returns a value when checkout creation failed.
      const errorMessage = await buyNow(null, variantId);
      if (errorMessage) {
        trackEvent({
          event: ANALYTICS_EVENTS.checkoutError,
          labels: {
            route: CHECKOUT_ROUTES.buyNow,
            location,
            error_reason: errorMessage,
          },
        });
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
