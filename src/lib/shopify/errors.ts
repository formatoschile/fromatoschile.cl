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

/** Thrown when a cart mutation returns no `cart` payload — the cartId
 * cookie points at a cart that no longer exists on Shopify's side. */
export class CartNotFoundError extends Error {
  constructor() {
    super("Cart not found");
    this.name = "CartNotFoundError";
  }
}

/** Distinguishes "the cartId cookie points at a cart that no longer exists"
 * (should self-heal by clearing the cookie) from any other failure — a
 * transport/GraphQL error unrelated to the cookie shouldn't wipe a valid
 * cart just because its message happens to mention "cart". */
export function isCartNotFoundError(error: unknown): boolean {
  return error instanceof CartNotFoundError;
}
