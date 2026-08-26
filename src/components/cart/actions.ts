"use server";

import * as Sentry from "@sentry/nextjs";
import type { Route } from "next";
import { cookies, headers } from "next/headers";
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
import { isRateLimited } from "@/lib/utils/rateLimit";

const MAX_ITEM_QUANTITY = 99;
const MAX_ATTRIBUTES = 20;
const MAX_ATTRIBUTE_LENGTH = 255;
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const RATE_LIMIT_MESSAGE =
  "Demasiadas solicitudes, intenta de nuevo en unos segundos";

export async function addItem(
  _prevState: unknown,
  selectedVariantId: string | undefined,
  attributes?: { key: string; value: string }[]
): Promise<Cart | string> {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  if (await isActionRateLimited("addItem")) {
    return RATE_LIMIT_MESSAGE;
  }

  try {
    // Create the cart lazily on first add — visitors without a cart never
    // trigger a cart-create mutation just by loading the page.
    const cartId = (await cookies()).get("cartId")?.value;
    if (!cartId) {
      await createCartAndSetCookie();
    }

    return await addToCart([
      {
        merchandiseId: selectedVariantId,
        quantity: 1,
        attributes: sanitizeAttributes(attributes),
      },
    ]);
  } catch (e) {
    return handleCartActionError(e, {
      action: "addItem",
      fallback: "Error adding item to cart",
    });
  }
}

export async function removeItem(
  _prevState: unknown,
  payload: { lineId?: string; merchandiseId: string }
): Promise<Cart | string> {
  if (await isActionRateLimited("removeItem")) {
    return RATE_LIMIT_MESSAGE;
  }

  try {
    const lineId = payload.lineId ?? (await findLineId(payload.merchandiseId));

    if (!lineId) {
      return "Item not found in cart";
    }

    return await removeFromCart([lineId]);
  } catch (e) {
    return handleCartActionError(e, {
      action: "removeItem",
      fallback: "Error removing item from cart",
    });
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

  if (
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > MAX_ITEM_QUANTITY
  ) {
    return `La cantidad debe ser un número entero entre 0 y ${MAX_ITEM_QUANTITY}`;
  }

  if (await isActionRateLimited("updateItemQuantity")) {
    return RATE_LIMIT_MESSAGE;
  }

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
    return handleCartActionError(e, {
      action: "updateItemQuantity",
      fallback: "Error updating item quantity",
    });
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

  if (await isActionRateLimited("buyNow")) {
    return RATE_LIMIT_MESSAGE;
  }

  let checkoutUrl: string;

  try {
    // A standalone cart for a direct "buy now" — keeps the user's main cart untouched.
    const cart = await createCart({
      lines: [{ merchandiseId: selectedVariantId, quantity: 1 }],
    });
    checkoutUrl = cart.checkoutUrl;
  } catch (e) {
    return handleCartActionError(e, {
      action: "buyNow",
      fallback: "Error starting checkout",
    });
  }

  // Must run outside try/catch — redirect() throws internally.
  // Checkout is an external Shopify URL, outside the typed-routes union.
  redirect(checkoutUrl as Route);
}

export async function redirectToCheckout() {
  if (await isActionRateLimited("redirectToCheckout")) {
    throw new Error("Too many requests");
  }

  let checkoutUrl: string;

  try {
    const cart = await getCart();

    if (!cart) {
      throw new Error("Cart not found");
    }
    checkoutUrl = cart.checkoutUrl;
  } catch (e) {
    Sentry.captureException(e, { tags: { action: "redirectToCheckout" } });
    await Sentry.flush(2000);
    throw e;
  }

  // Must run outside try/catch — redirect() throws internally.
  // Checkout is an external Shopify URL, outside the typed-routes union.
  redirect(checkoutUrl as Route);
}

// Server Actions are POST-callable directly by their action id, bypassing
// any client-side debouncing — key the limiter by caller IP so a scripted
// loop can't burn through the shared Storefront API token via a single action.
async function isActionRateLimited(action: string): Promise<boolean> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  return isRateLimited(`${action}:${ip}`);
}

function sanitizeAttributes(
  attributes: { key: string; value: string }[] | undefined
): { key: string; value: string }[] | undefined {
  if (!attributes) {
    return undefined;
  }

  return attributes
    .slice(0, MAX_ATTRIBUTES)
    .filter((attribute) => attribute.key && attribute.value)
    .map((attribute) => ({
      key: attribute.key.slice(0, MAX_ATTRIBUTE_LENGTH),
      value: attribute.value.slice(0, MAX_ATTRIBUTE_LENGTH),
    }));
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
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
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

// Shared tail for every cart-mutating action's catch block: report to
// Sentry, self-heal a stale cart cookie, and surface a user-safe message.
async function handleCartActionError(
  error: unknown,
  { action, fallback }: { action: string; fallback: string }
): Promise<string> {
  Sentry.captureException(error, { tags: { action } });
  // Vercel's Node.js runtime can freeze the function right after the
  // response is sent — block here so the event actually reaches Sentry.
  await Sentry.flush(2000);
  await clearStaleCartCookie(error);
  return error instanceof CartUserError ? error.message : fallback;
}
