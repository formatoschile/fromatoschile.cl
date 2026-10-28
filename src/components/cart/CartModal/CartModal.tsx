"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { useCart } from "../CartContext";
import { OpenCart } from "../OpenCart";

import { CartModalContent } from "./CartModalContent";
import { CloseCartButton } from "./CloseCartButton";

interface CartModalProps {
  iconClassName?: string;
}

export const CartModal: React.FC<CartModalProps> = ({ iconClassName }) => {
  const { cart, isCartOpen, openCart, closeCart, updateCartItem } = useCart();

  return (
    <>
      <button
        aria-label="Abrir carrito"
        onClick={openCart}
        className="cursor-pointer"
      >
        <OpenCart quantity={cart?.totalQuantity} className={iconClassName} />
      </button>

      <Transition show={isCartOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-out duration-150"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in duration-150"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="border-brand-ink/10 bg-primary/90 text-brand-ink fixed top-0 right-0 bottom-0 flex h-full w-full flex-col border-l p-6 backdrop-blur-xl md:w-[390px]">
              <div className="flex items-center justify-between">
                <DialogTitle as="p" className="text-lg font-semibold">
                  Tu carrito
                </DialogTitle>
                <button
                  className="cursor-pointer"
                  aria-label="Cerrar carrito"
                  onClick={closeCart}
                >
                  <CloseCartButton />
                </button>
              </div>

              <CartModalContent
                closeCart={closeCart}
                cart={cart}
                updateCartItem={updateCartItem}
              />
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};
