"use client";

import { Suspense } from "react";
import { MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

import { CartModal } from "@/components/cart/CartModal/CartModal";
import { OpenCart } from "@/components/cart/OpenCart";
// import { getMenu } from "@/lib/shopify";
import { Menu } from "@/lib/shopify/types";

import logoWhite from "../../../../public/logo/logo_white.png";

import { MobileMenu } from "./MobileMenu";

// Default menu items matching the design
const defaultMenuItems: Menu[] = [{ title: "Collections", path: "/search" }];

export const Navbar = () => {
  const menu = defaultMenuItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4">
      <div className="flex items-center justify-between w-full px-16">
        {/* Mobile Menu - Left Side */}
        <div className="absolute left-4 block md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>

        {/* Logo - Left Side */}
        <Link
          href="/"
          className="cursor-pointer transition-transform duration-300 ease-in-out"
        >
          <Image
            src={logoWhite}
            alt="Logo"
            className="object-contain"
            width={80}
            height={80}
          />
        </Link>

        {/* Right Side Icons */}
        <div className="flex items-center gap-3 transition-transform duration-300 ease-in-out">
          {/* Search Icon */}
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Link>

          {/* User Icon */}
          <Link
            href="/account"
            className="flex h-10 w-10 items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <UserIcon className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Suspense
            fallback={
              <button aria-label="Open cart">
                <OpenCart quantity={0} />
              </button>
            }
          >
            <CartModal />
          </Suspense>
        </div>
      </div>
    </nav>
  );
};
