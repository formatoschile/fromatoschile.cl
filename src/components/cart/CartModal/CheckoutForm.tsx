"use client";

import {
  ANALYTICS_EVENTS,
  CHECKOUT_ROUTES,
  LOCATIONS,
  trackEvent,
} from "@/lib/analytics";

import { redirectToCheckout } from "../actions";

import { CheckoutButton } from "./CheckoutButton";
import { useCheckoutRedirect } from "./useCheckoutRedirect";

export const CheckoutForm: React.FC = () => {
  const { isRedirecting, handleCheckoutSubmit } = useCheckoutRedirect();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // A funnel step for GA4 only. Shopify reports the real InitiateCheckout
    // when checkout loads (tracking plan, section 2).
    trackEvent({
      event: ANALYTICS_EVENTS.checkoutClick,
      labels: { route: CHECKOUT_ROUTES.cart, location: LOCATIONS.cart },
    });
    handleCheckoutSubmit(event);
  };

  return (
    <form action={redirectToCheckout} onSubmit={handleSubmit}>
      <CheckoutButton isRedirecting={isRedirecting} />
    </form>
  );
};
