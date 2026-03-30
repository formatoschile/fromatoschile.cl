"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { createCartAndSetCookie } from "../actions";
import { useCart } from "../CartContext";
import { OpenCart } from "../OpenCart";

import { CartModalContent } from "./CartModalContent";

export const CartModal = () => {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const prevQuantityRef = useRef(cart?.totalQuantity);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  const qty = cart?.totalQuantity;
  if (qty && qty > 0 && qty !== prevQuantityRef.current) {
    prevQuantityRef.current = qty;
    if (!isOpen) {
      setIsOpen(true);
    }
  }

  return (
    <>
      <button aria-label="Open cart" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} />
      </button>

      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-brand-secondary bg-primary/90 p-6 text-white backdrop-blur-xl md:w-[390px]">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Il tuo carrello</p>
                <button
                  className="cursor-pointer"
                  aria-label="Close cart"
                  onClick={closeCart}
                >
                  <CloseCartButton />
                </button>
              </div>

              <CartModalContent closeCart={closeCart} cart={cart} />
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};

const CloseCartButton = () => {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border transition-colors border-accent text-white">
      <XMarkIcon className="h-6 transition-all ease-in-out hover:scale-110" />
    </div>
  );
};
