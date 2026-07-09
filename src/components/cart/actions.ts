"use server";

import type { Route } from "next";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "@/lib/shopify";
import { TAGS } from "@/lib/utils/constants";

export async function addItem(
  _prevState: unknown,
  selectedVariantId: string | undefined,
  attributes?: { key: string; value: string }[]
) {
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

    await addToCart([
      { merchandiseId: selectedVariantId, quantity: 1, attributes },
    ]);
    // No data-cache entry carries this tag (getCart is per-user and uncached);
    // the call's purpose is the client router-cache refresh it triggers, which
    // re-runs the layout's getCart and syncs the optimistic cart UI.
    revalidateTag(TAGS.cart, "seconds");
  } catch (e) {
    console.error(e);
    return "Error adding item to cart";
  }
}

export async function removeItem(
  _prevState: unknown,
  payload: { lineId?: string; merchandiseId: string }
) {
  try {
    const lineId = payload.lineId ?? (await findLineId(payload.merchandiseId));

    if (!lineId) {
      return "Item not found in cart";
    }

    await removeFromCart([lineId]);
    revalidateTag(TAGS.cart, "seconds");
  } catch (e) {
    console.error(e);
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  _prevState: unknown,
  payload: {
    lineId?: string;
    merchandiseId: string;
    quantity: number;
  }
) {
  const { merchandiseId, quantity } = payload;

  try {
    const lineId = payload.lineId ?? (await findLineId(merchandiseId));

    if (lineId) {
      if (quantity === 0) {
        await removeFromCart([lineId]);
      } else {
        await updateCart([{ id: lineId, merchandiseId, quantity }]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }]);
    }

    revalidateTag(TAGS.cart, "seconds");
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
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
    console.error(e);
    return "Error starting checkout";
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

  (await cookies()).set("cartId", cart.id);
}
