import type { ShopifyUserError } from "./types";

/** Thrown when the Storefront API returns a transport/GraphQL-level error. */
export class ShopifyApiError extends Error {
  status: number;
  query?: string;

  constructor({
    message,
    status,
    query,
    cause,
  }: {
    message: string;
    status: number;
    query?: string;
    cause?: unknown;
  }) {
    super(message, { cause });
    this.name = "ShopifyApiError";
    this.status = status;
    this.query = query;
  }
}

/** Thrown when a cart mutation succeeds at the transport level but Shopify
 * rejects it for business reasons (out of stock, invalid variant, etc). */
export class CartUserError extends Error {
  constructor(userErrors: ShopifyUserError[]) {
    super(userErrors.map((error) => error.message).join(" "));
    this.name = "CartUserError";
  }
}

/** Distinguishes "the cartId cookie points at a cart that no longer exists"
 * (should self-heal by clearing the cookie) from a `CartUserError` (the cart
 * is fine, Shopify just rejected this specific line — e.g. out of stock). */
export function isCartNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error) || error instanceof CartUserError) {
    return false;
  }

  return /cart/i.test(error.message);
}
