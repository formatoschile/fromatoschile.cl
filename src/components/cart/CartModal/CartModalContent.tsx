"use client";

import { useFormStatus } from "react-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price";
import { Cart } from "@/lib/shopify/types";

import { redirectToCheckout } from "../actions";
import type { UpdateType } from "../cartReducer";

import { CartItem } from "./CartItem";

interface CartModalContentProps {
  closeCart: () => void;
  cart: Cart | undefined;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => void;
}

export const CartModalContent: React.FC<CartModalContentProps> = ({
  closeCart,
  cart,
  updateCartItem,
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

  const sortedLines = cart.lines.toSorted((a, b) =>
    a.merchandise.product.title.localeCompare(b.merchandise.product.title)
  );

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden p-1">
      <ul className="grow overflow-auto py-4">
        {sortedLines.map((item, i) => (
          <CartItem
            key={i}
            item={item}
            closeCart={closeCart}
            updateCartItem={updateCartItem}
          />
        ))}
      </ul>
      <div className="py-4 text-sm text-brand-ink">
        <div className="mb-3 flex items-center justify-between border-b border-brand-ink/10 pb-1">
          <p>Impuestos</p>
          <Price
            className="text-right text-base"
            amount={cart.cost.totalTaxAmount.amount}
            currencyCode={cart.cost.totalTaxAmount.currencyCode}
          />
        </div>
        <div className="mb-3 flex items-center justify-between border-b border-brand-ink/10 pb-1 pt-1">
          <p>Envío</p>
          <p className="text-right">Se calcula al finalizar la compra</p>
        </div>
        <div className="mb-3 flex items-center justify-between border-b border-brand-ink/10 pb-1 pt-1">
          <p>Total</p>
          <Price
            className="text-right text-base"
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
    <Button className="w-full" type="submit" variant="ink" pending={pending}>
      Continuar con el pago
    </Button>
  );
};
