import { ensureStartsWith } from "@/lib/utils";
import { SHOPIFY_GRAPHQL_API_ENDPOINT } from "@/lib/utils/constants";
import { env } from "@/lib/utils/env";
import { isShopifyError } from "@/lib/utils/type-guards";

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function shopifyFetch<T>({
  headers: extraHeaders,
  query,
  variables,
}: {
  headers?: Record<string, string>;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const response = await fetch(getEndpoint(), {
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
    });

    const body = (await response.json()) as T & {
      errors?: { message: string; cause?: unknown }[];
    };

    if (body.errors) {
      throw body.errors[0];
    }

    return { status: response.status, body };
  } catch (e: unknown) {
    console.log("Error Requesting Shopify:", e);

    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() ?? "unknown",
        status: e.status ?? 500,
        message: e.message,
        query,
      };
    }

    throw { error: e, query };
  }
}

export const getDomain = () =>
  ensureStartsWith(env.SHOPIFY_STORE_DOMAIN, "https://");

const getEndpoint = () => `${getDomain()}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
