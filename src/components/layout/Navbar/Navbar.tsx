import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { CartModal } from "@/components/cart/CartModal/CartModal";
import { OpenCart } from "@/components/cart/OpenCart";

import logoGreen from "../../../../public/logo/logo_green_small.png";

export const Navbar = () => {
  return (
    <nav className="bg-primary/80 fixed top-0 right-0 left-0 z-50 backdrop-blur-sm">
      <div className="grid grid-cols-2 items-center px-6 py-5 md:grid-cols-3 md:px-24">
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
          className="text-brand-ink hover:text-brand-ink/70 hidden justify-self-center text-xs tracking-[0.25em] uppercase transition-colors md:block"
        >
          Todos los documentos
        </Link>

        {/* Cart — right */}
        <div className="flex items-center justify-end gap-6 justify-self-end">
          <Suspense
            fallback={
              <button aria-label="Abrir carrito">
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
