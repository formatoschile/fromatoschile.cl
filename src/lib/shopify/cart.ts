import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";

import { shopifyFetch } from "./client";
import { CartNotFoundError, CartUserError } from "./errors";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { getCartQuery } from "./queries/cart";
import { reshapeCart } from "./reshape";
import type {
  Cart,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCreateCartOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  ShopifyUserError,
} from "./types";

export async function createCart({
  lines,
}: {
  lines?: { merchandiseId: string; quantity: number }[];
} = {}): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    variables: { lineItems: lines },
  });

  return unwrapCartPayload(res.body.data.cartCreate);
}

export async function addToCart(
  lines: {
    merchandiseId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[]
): Promise<Cart> {
  const cartId = await getCartId();

  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
  });

  return unwrapCartPayload(res.body.data.cartLinesAdd);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = await getCartId();

  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
    },
  });

  return unwrapCartPayload(res.body.data.cartLinesRemove);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = await getCartId();

  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
    },
  });

  return unwrapCartPayload(res.body.data.cartLinesUpdate);
}

function unwrapCartPayload({
  cart,
  userErrors,
}: {
  cart: ShopifyCart | null | undefined;
  userErrors: ShopifyUserError[];
}): Cart {
  if (userErrors.length > 0) {
    throw new CartUserError(userErrors);
  }
  if (!cart) {
    throw new CartNotFoundError();
  }

  return reshapeCart(cart);
}

export async function getCart(): Promise<Cart | undefined> {
  const cartId = (await cookies()).get("cartId")?.value;

  if (!cartId) {
    return undefined;
  }

  // The cart is not essential to render — if Shopify is unreachable, degrade
  // to "no cart" rather than taking down the root layout for every page.
  try {
    const res = await shopifyFetch<ShopifyCartOperation>({
      query: getCartQuery,
      variables: { cartId },
    });

    // Old carts becomes `null` when you checkout.
    if (!res.body.data.cart) {
      return undefined;
    }

    return reshapeCart(res.body.data.cart);
  } catch (error) {
    console.error("Failed to load cart:", error);
    Sentry.captureException(error, {
      level: "warning",
      tags: { action: "getCart" },
    });
    return undefined;
  }
}

async function getCartId(): Promise<string> {
  const cartId = (await cookies()).get("cartId")?.value;

  if (!cartId) {
    throw new Error("Cart ID is not set");
  }

  return cartId;
}
