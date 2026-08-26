"use server";

import * as Sentry from "@sentry/nextjs";
import type { Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "@/lib/shopify";
import { CartUserError, isCartNotFoundError } from "@/lib/shopify/errors";
import type { Cart } from "@/lib/shopify/types";

export async function addItem(
  _prevState: unknown,
  selectedVariantId: string | undefined,
  attributes?: { key: string; value: string }[]
): Promise<Cart | string> {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  try {
    // Create the cart lazily on first add — visitors without a cart never
    // trigger a cart-create mutation just by loading the page.
    const cartId = (await cookies()).get("cartId")?.value;
    if (!cartId) {
      await createCartAndSetCookie();
    }

    return await addToCart([
      { merchandiseId: selectedVariantId, quantity: 1, attributes },
    ]);
  } catch (e) {
    Sentry.captureException(e, { tags: { action: "addItem" } });
    // Vercel's Node.js runtime can freeze the function right after the
    // response is sent — block here so the event actually reaches Sentry.
    await Sentry.flush(2000);
    await clearStaleCartCookie(e);
    return errorMessage(e, "Error adding item to cart");
  }
}

export async function removeItem(
  _prevState: unknown,
  payload: { lineId?: string; merchandiseId: string }
): Promise<Cart | string> {
  try {
    const lineId = payload.lineId ?? (await findLineId(payload.merchandiseId));

    if (!lineId) {
      return "Item not found in cart";
    }

    return await removeFromCart([lineId]);
  } catch (e) {
    Sentry.captureException(e, { tags: { action: "removeItem" } });
    await Sentry.flush(2000);
    await clearStaleCartCookie(e);
    return errorMessage(e, "Error removing item from cart");
  }
}

export async function updateItemQuantity(
  _prevState: unknown,
  payload: {
    lineId?: string;
    merchandiseId: string;
    quantity: number;
  }
): Promise<Cart | string | undefined> {
  const { merchandiseId, quantity } = payload;

  try {
    const lineId = payload.lineId ?? (await findLineId(merchandiseId));

    if (lineId) {
      if (quantity === 0) {
        return await removeFromCart([lineId]);
      }
      return await updateCart([{ id: lineId, merchandiseId, quantity }]);
    }

    // If the item doesn't exist in the cart and quantity > 0, add it
    if (quantity > 0) {
      return await addToCart([{ merchandiseId, quantity }]);
    }

    return undefined;
  } catch (e) {
    Sentry.captureException(e, { tags: { action: "updateItemQuantity" } });
    await Sentry.flush(2000);
    await clearStaleCartCookie(e);
    return errorMessage(e, "Error updating item quantity");
  }
}

// Fallback for optimistic items added client-side before the server assigned
// a line id — resolves the line by merchandise id with one extra fetch.
async function findLineId(merchandiseId: string): Promise<string | undefined> {
  const cart = await getCart();

  return cart?.lines.find((line) => line.merchandise.id === merchandiseId)?.id;
}

export async function buyNow(
  _prevState: unknown,
  selectedVariantId: string | undefined
) {
  if (!selectedVariantId) {
    return "Error starting checkout";
  }

  let checkoutUrl: string;

  try {
    // A standalone cart for a direct "buy now" — keeps the user's main cart untouched.
    const cart = await createCart({
      lines: [{ merchandiseId: selectedVariantId, quantity: 1 }],
    });
    checkoutUrl = cart.checkoutUrl;
  } catch (e) {
    Sentry.captureException(e, { tags: { action: "buyNow" } });
    await Sentry.flush(2000);
    return errorMessage(e, "Error starting checkout");
  }

  // Must run outside try/catch — redirect() throws internally.
  // Checkout is an external Shopify URL, outside the typed-routes union.
  redirect(checkoutUrl as Route);
}

export async function redirectToCheckout() {
  const cart = await getCart();

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Checkout is an external Shopify URL, outside the typed-routes union.
  redirect(cart.checkoutUrl as Route);
}

async function createCartAndSetCookie() {
  const cart = await createCart();

  if (!cart.id) {
    throw new Error("Cart created without an id");
  }

  (await cookies()).set("cartId", cart.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

// A stale/expired cartId cookie makes every cart mutation fail forever until
// the cookie is cleared — self-heal so the next attempt creates a fresh cart
// instead of repeating the same failure.
async function clearStaleCartCookie(error: unknown) {
  if (isCartNotFoundError(error)) {
    (await cookies()).delete("cartId");
  }
}

// Shopify `userErrors` carry a message worth showing the customer (e.g. "this
// variant is out of stock") — everything else collapses to a generic string.
function errorMessage(error: unknown, fallback: string): string {
  return error instanceof CartUserError ? error.message : fallback;
}
