"use client";

import { redirectToCheckout } from "../actions";

import { CheckoutButton } from "./CheckoutButton";
import { useCheckoutRedirect } from "./useCheckoutRedirect";

export const CheckoutForm: React.FC = () => {
  const { isRedirecting, handleCheckoutSubmit } = useCheckoutRedirect();

  return (
    <form action={redirectToCheckout} onSubmit={handleCheckoutSubmit}>
      <CheckoutButton isRedirecting={isRedirecting} />
    </form>
  );
};
