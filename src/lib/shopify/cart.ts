import { cookies } from "next/headers";

import { shopifyFetch } from "./client";
import { CartUserError } from "./errors";
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

  const { cart, userErrors } = res.body.data.cartCreate;
  assertNoUserErrors(userErrors);
  if (!cart) {
    throw new Error("Cart not found");
  }

  return reshapeCart(cart);
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

  const { cart, userErrors } = res.body.data.cartLinesAdd;
  assertNoUserErrors(userErrors);
  if (!cart) {
    throw new Error("Cart not found");
  }

  return reshapeCart(cart);
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

  const { cart, userErrors } = res.body.data.cartLinesRemove;
  assertNoUserErrors(userErrors);
  if (!cart) {
    throw new Error("Cart not found");
  }

  return reshapeCart(cart);
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

  const { cart, userErrors } = res.body.data.cartLinesUpdate;
  assertNoUserErrors(userErrors);
  if (!cart) {
    throw new Error("Cart not found");
  }

  return reshapeCart(cart);
}

function assertNoUserErrors(userErrors: ShopifyUserError[]): void {
  if (userErrors.length > 0) {
    throw new CartUserError(userErrors);
  }
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
