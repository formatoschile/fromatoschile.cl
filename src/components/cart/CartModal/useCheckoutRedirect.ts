"use client";

import { useEffect, useState } from "react";
import { preconnect } from "react-dom";

import { useCart } from "../CartContext";

interface UseCheckoutRedirectResult {
  isRedirecting: boolean;
  handleCheckoutSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Sends the shopper straight to Shopify checkout using the `checkoutUrl`
 * already held in the client cart, skipping the `redirectToCheckout` server
 * round trip (Vercel hop + cold start + a second Storefront API fetch).
 *
 * Attach `handleCheckoutSubmit` as the `onSubmit` of a form whose `action` is
 * `redirectToCheckout`: when the direct URL isn't safe to use (no confirmed
 * cart yet, or a cart mutation still in flight) the submit falls through to
 * the server action, which Next.js queues behind any pending mutation.
 */
export function useCheckoutRedirect(): UseCheckoutRedirectResult {
  const { cart, hasPendingCartUpdate } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const checkoutUrl = cart?.checkoutUrl;
  const canRedirectDirectly = Boolean(checkoutUrl) && !hasPendingCartUpdate;

  // Warm up DNS/TLS to the checkout host while the cart is open.
  if (checkoutUrl) {
    preconnect(new URL(checkoutUrl).origin);
  }

  // Coming back from checkout with the browser's back button can restore this
  // page from the bfcache with the spinner still showing — reset it.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsRedirecting(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleCheckoutSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!canRedirectDirectly || !checkoutUrl) {
      return;
    }

    // Prevents React from running the form's server action.
    event.preventDefault();
    setIsRedirecting(true);
    window.location.assign(checkoutUrl);
  };

  return { isRedirecting, handleCheckoutSubmit };
}
