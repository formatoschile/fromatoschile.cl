"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { CartModal } from "@/components/cart/CartModal/CartModal";
import { OpenCart } from "@/components/cart/OpenCart";

import logoGreen from "../../../../public/logo/logo_green_small.png";

export const Navbar = () => {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-primary/80 backdrop-blur-sm">
      <div className="grid grid-cols-2 items-center px-6 py-5 md:grid-cols-3 md:px-12">
        {/* Logo — left */}
        <Link
          href="/"
          className="justify-self-start transition-transform duration-300 ease-in-out hover:opacity-80"
        >
          <Image
            src={logoGreen}
            alt="Formatos Chile"
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>

        {/* Primary link — center */}
        <Link
          href="/todos-los-documentos"
          className="hidden justify-self-center text-xs uppercase tracking-[0.25em] text-brand-ink transition-colors hover:text-brand-ink/70 md:block"
        >
          Todos los documentos
        </Link>

        {/* Account + cart — right */}
        <div className="flex items-center justify-end gap-6 justify-self-end">
          <Link
            href="/account"
            className="hidden text-sm text-brand-ink transition-colors hover:text-brand-ink/70 sm:block"
          >
            Mi Cuenta
          </Link>

          <Suspense
            fallback={
              <button aria-label="Open cart">
                <OpenCart quantity={0} className="text-brand-ink" />
              </button>
            }
          >
            <CartModal iconClassName="text-brand-ink" />
          </Suspense>
        </div>
      </div>
    </nav>
  );
};
