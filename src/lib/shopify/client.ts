import { env } from "@/env";
import { ensureStartsWith } from "@/lib/utils";
import { SHOPIFY_GRAPHQL_API_ENDPOINT } from "@/lib/utils/constants";

import { ShopifyApiError } from "./errors";

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

type GraphqlError = {
  message: string;
  extensions?: { code?: string };
};

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

export async function shopifyFetch<T>({
  headers: extraHeaders,
  query,
  variables,
}: {
  headers?: Record<string, string>;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
    }

    try {
      return await performRequest<T>({ extraHeaders, query, variables });
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) {
        console.error("Shopify request failed:", error);
        throw error;
      }
    }
  }

  console.error("Shopify request failed after retries:", lastError);
  throw lastError;
}

async function performRequest<T>({
  extraHeaders,
  query,
  variables,
}: {
  extraHeaders?: Record<string, string>;
  query: string;
  variables?: object;
}): Promise<{ status: number; body: T }> {
  let response: Response;

  try {
    response = await fetch(getEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        ...extraHeaders,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new ShopifyApiError({
      message: "Failed to reach Shopify Storefront API",
      status: 503,
      query,
      cause,
    });
  }

  const body = (await response.json()) as T & { errors?: GraphqlError[] };

  if (body.errors?.length) {
    const [firstError] = body.errors;
    throw new ShopifyApiError({
      message: firstError.message,
      status:
        firstError.extensions?.code === "THROTTLED" ? 429 : response.status,
      query,
      cause: firstError,
    });
  }

  if (!response.ok) {
    throw new ShopifyApiError({
      message: `Shopify Storefront API responded with ${response.status}`,
      status: response.status,
      query,
    });
  }

  return { status: response.status, body };
}

function isRetryableError(error: unknown): boolean {
  return (
    error instanceof ShopifyApiError &&
    (error.status === 429 || error.status >= 500)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getDomain = () =>
  ensureStartsWith(env.SHOPIFY_STORE_DOMAIN, "https://");

const getEndpoint = () => `${getDomain()}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
