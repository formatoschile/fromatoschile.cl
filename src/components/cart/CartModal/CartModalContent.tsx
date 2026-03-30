"use client";

import { useFormStatus } from "react-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

import { Price } from "@/components/Price";
import { Button } from "@/components/ui/Button/Button";
import { Cart } from "@/lib/shopify/types";

import { redirectToCheckout } from "../actions";

import { CartItem } from "./CartItem";

interface CartModalContentProps {
  closeCart: () => void;
  cart: Cart | undefined;
}

export const CartModalContent: React.FC<CartModalContentProps> = ({
  closeCart,
  cart,
}) => {
  if (!cart) {
    return (
      <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
        <ShoppingCartIcon className="h-16" />
        <p className="mt-6 text-center text-2xl font-bold">
          Tu carrito está vacío.
        </p>
      </div>
    );
  }

  const sortedLines = cart.lines.sort((a, b) =>
    a.merchandise.product.title.localeCompare(b.merchandise.product.title)
  );

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden p-1">
      <ul className="grow overflow-auto py-4">
        {sortedLines.map((item, i) => (
          <CartItem key={i} item={item} closeCart={closeCart} />
        ))}
      </ul>
      <div className="py-4 text-sm text-white">
        <div className="mb-3 flex items-center justify-between border-b  pb-1 border-accent">
          <p>Impuestos</p>
          <Price
            className="text-right text-base text-white"
            amount={cart.cost.totalTaxAmount.amount}
            currencyCode={cart.cost.totalTaxAmount.currencyCode}
          />
        </div>
        <div className="mb-3 flex items-center justify-between border-b pb-1 pt-1 border-accent">
          <p>Envío</p>
          <p className="text-right">Calcolata al checkout</p>
        </div>
        <div className="mb-3 flex items-center justify-between border-b pb-1 pt-1 border-accent">
          <p>Total</p>
          <Price
            className="text-right text-base  text-white"
            amount={cart.cost.totalAmount.amount}
            currencyCode={cart.cost.totalAmount.currencyCode}
          />
        </div>
      </div>

      <form action={redirectToCheckout}>
        <CheckoutButton />
      </form>
    </div>
  );
};

const CheckoutButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      type="submit"
      variant="accent"
      label="Continuar con el pago"
      pending={pending}
    />
  );
};
