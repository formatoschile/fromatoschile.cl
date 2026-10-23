import { env } from "@/env";
import { ensureStartsWith } from "@/lib/utils";

import { ShopifyApiError } from "../errors";

/**
 * Minimal Shopify Admin API client, authenticated with the client credentials
 * grant of a Dev Dashboard app (`SHOPIFY_ADMIN_CLIENT_ID`/`_SECRET`). Tokens
 * last 24h; one is cached per process and refreshed shortly before expiry.
 *
 * Server-only — never import this from client components. (Not enforced with
 * `server-only`: the backfill script imports it outside Next.)
 */

const ADMIN_API_VERSION = "2025-10";
const REQUEST_TIMEOUT_MS = 30_000;
const TOKEN_REFRESH_MARGIN_MS = 5 * 60_000;
const MAX_THROTTLE_RETRIES = 5;
const THROTTLE_BASE_DELAY_MS = 1_000;

interface CachedToken {
  value: string;
  expiresAt: number;
}

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

interface GraphqlError {
  message: string;
  extensions?: { code?: string };
}

let cachedToken: CachedToken | null = null;

export function hasAdminCredentials(): boolean {
  return Boolean(
    env.SHOPIFY_ADMIN_CLIENT_ID && env.SHOPIFY_ADMIN_CLIENT_SECRET
  );
}

export async function adminFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: object;
}): Promise<T> {
  let hasRefreshedToken = false;

  for (let attempt = 0; ; attempt++) {
    try {
      return await performRequest<T>({ query, variables });
    } catch (error) {
      if (!(error instanceof ShopifyApiError)) {
        throw error;
      }

      // A cached token goes bad when the app is reinstalled or its secret
      // rotated — fetch a fresh one once before giving up.
      if (error.status === 401 && !hasRefreshedToken) {
        cachedToken = null;
        hasRefreshedToken = true;
        continue;
      }

      if (error.status !== 429 || attempt >= MAX_THROTTLE_RETRIES) {
        throw error;
      }
      await sleep(THROTTLE_BASE_DELAY_MS * 2 ** attempt);
    }
  }
}

async function performRequest<T>({
  query,
  variables,
}: {
  query: string;
  variables?: object;
}): Promise<T> {
  const response = await fetch(
    `${getShopOrigin()}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": await getAccessToken(),
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  );

  const body = (await response.json()) as {
    data?: T;
    errors?: GraphqlError[] | string;
  };

  if (Array.isArray(body.errors) && body.errors.length) {
    const [firstError] = body.errors;
    throw new ShopifyApiError({
      message: firstError.message,
      status:
        firstError.extensions?.code === "THROTTLED" ? 429 : response.status,
      query,
      cause: firstError,
    });
  }

  if (!response.ok || !body.data) {
    throw new ShopifyApiError({
      message: `Shopify Admin API responded with ${response.status}: ${JSON.stringify(body.errors ?? body)}`,
      status: response.status,
      query,
    });
  }

  return body.data;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  if (!env.SHOPIFY_ADMIN_CLIENT_ID || !env.SHOPIFY_ADMIN_CLIENT_SECRET) {
    throw new Error(
      "SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET must be set to use the Admin API."
    );
  }

  const response = await fetch(`${getShopOrigin()}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.SHOPIFY_ADMIN_CLIENT_ID,
      client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new ShopifyApiError({
      message: `Shopify Admin token request failed with ${response.status}: ${await response.text()}`,
      status: response.status,
    });
  }

  const { access_token, expires_in } =
    (await response.json()) as AccessTokenResponse;

  cachedToken = {
    value: access_token,
    expiresAt: Date.now() + expires_in * 1000 - TOKEN_REFRESH_MARGIN_MS,
  };

  return cachedToken.value;
}

function getShopOrigin(): string {
  return ensureStartsWith(env.SHOPIFY_STORE_DOMAIN, "https://").replace(
    /\/+$/,
    ""
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
