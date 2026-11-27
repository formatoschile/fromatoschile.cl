/// <reference types="bun" />

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

/**
 * Runs the pixel source the way Shopify's lax sandbox does — `analytics`,
 * `browser`, `init` and `api` as globals — with fakes, and records every
 * gtag call it makes.
 */
const SOURCE = readFileSync(join(import.meta.dir, "ga4-checkout.js"), "utf8");

interface Harness {
  calls: unknown[][];
  emit: (name: string, event: unknown) => Promise<void>;
}

function runPixel({
  cookies = {},
  privacy = { analyticsProcessingAllowed: true, marketingAllowed: true },
}: {
  cookies?: Record<string, string>;
  privacy?: Record<string, boolean>;
} = {}): Harness {
  const handlers: Record<string, (event: unknown) => void> = {};
  const storage = new Map<string, string>();
  const fakeWindow: { dataLayer?: unknown[] } = {};
  const fakeDocument = {
    createElement: () => ({ setAttribute: () => {} }),
    head: { appendChild: () => {} },
  };

  const analytics = {
    subscribe: (name: string, handler: (event: unknown) => void) => {
      handlers[name] = handler;
    },
  };
  const browser = {
    cookie: { get: async (name: string) => cookies[name] ?? "" },
    localStorage: {
      getItem: async (key: string) => storage.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        storage.set(key, value);
      },
    },
  };
  const init = { customerPrivacy: privacy };
  const api = { customerPrivacy: { subscribe: () => {} } };

  // oxlint-disable-next-line no-new-func -- executing the pixel as Shopify does
  new Function(
    "analytics",
    "browser",
    "init",
    "api",
    "window",
    "document",
    SOURCE
  )(analytics, browser, init, api, fakeWindow, fakeDocument);

  return {
    get calls() {
      return (fakeWindow.dataLayer ?? []).map((entry) =>
        Array.from(entry as ArrayLike<unknown>)
      );
    },
    emit: async (name, event) => {
      handlers[name]?.(event);
      // Let the async send (cookie reads, storage) settle.
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
  };
}

function checkoutEvent({
  token = "tok-1",
  orderId = null as string | null,
}: { token?: string; orderId?: string | null } = {}) {
  return {
    context: {
      document: {
        location: { href: "https://checkout.formatoschile.cl/checkouts/abc" },
        referrer: "https://www.formatoschile.cl/product/contrato",
      },
    },
    data: {
      checkout: {
        token,
        currencyCode: "CLP",
        totalPrice: { amount: 14990, currencyCode: "CLP" },
        totalTax: { amount: 2393, currencyCode: "CLP" },
        discountApplications: [],
        order: orderId ? { id: orderId } : { id: null },
        lineItems: [
          {
            title: "Contrato de Arriendo",
            quantity: 1,
            variant: {
              id: "gid://shopify/ProductVariant/67793899159604",
              price: { amount: 14990, currencyCode: "CLP" },
              product: { title: "Contrato de Arriendo", type: "civil" },
            },
          },
        ],
      },
    },
  };
}

function eventsNamed(calls: unknown[][], name: string) {
  return calls.filter(([kind, event]) => kind === "event" && event === name);
}

const COOKIES = {
  _ga: "GA1.1.123456789.1700000000",
  _ga_JTP6VGESGM: "GS2.1.s1764240000$o3$g1$t1764240100$j60$l0$h0",
};

describe("GA4 checkout pixel", () => {
  test("configures gtag with the site's client ID and stores nothing", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    await pixel.emit("checkout_started", checkoutEvent());

    const config = pixel.calls.find(([kind]) => kind === "config");
    expect(config).toEqual([
      "config",
      "G-JTP6VGESGM",
      {
        send_page_view: false,
        client_storage: "none",
        client_id: "123456789.1700000000",
      },
    ]);
  });

  test("begin_checkout carries the site's session, real URL and items", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    await pixel.emit("checkout_started", checkoutEvent());

    const [[, , params]] = eventsNamed(pixel.calls, "begin_checkout");
    expect(params).toMatchObject({
      send_to: "G-JTP6VGESGM",
      currency: "CLP",
      value: 14990,
      session_id: "1764240000",
      page_location: "https://checkout.formatoschile.cl/checkouts/abc",
      page_referrer: "https://www.formatoschile.cl/product/contrato",
      items: [
        {
          item_id: "67793899159604",
          item_name: "Contrato de Arriendo",
          item_category: "civil",
          price: 14990,
          quantity: 1,
        },
      ],
    });
  });

  test("reads the older GS1 session cookie too", async () => {
    const pixel = runPixel({
      cookies: { ...COOKIES, _ga_JTP6VGESGM: "GS1.1.1764240000.3.1.1764240100.0.0.0" },
    });
    await pixel.emit("checkout_started", checkoutEvent());

    const [[, , params]] = eventsNamed(pixel.calls, "begin_checkout");
    expect(params).toHaveProperty("session_id", "1764240000");
  });

  test("re-entering the same checkout sends begin_checkout once", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    await pixel.emit("checkout_started", checkoutEvent());
    await pixel.emit("checkout_started", checkoutEvent());

    expect(eventsNamed(pixel.calls, "begin_checkout")).toHaveLength(1);
  });

  test("purchase has transaction ID, IVA-inclusive value and tax, once", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    const completed = checkoutEvent({ orderId: "gid://shopify/Order/5551" });
    await pixel.emit("checkout_completed", completed);
    await pixel.emit("checkout_completed", completed);

    const purchases = eventsNamed(pixel.calls, "purchase");
    expect(purchases).toHaveLength(1);
    expect(purchases[0][2]).toMatchObject({
      transaction_id: "5551",
      value: 14990,
      tax: 2393,
      currency: "CLP",
    });
  });

  test("without GA cookies it still sends, with no client or session ID", async () => {
    const pixel = runPixel();
    await pixel.emit("payment_info_submitted", checkoutEvent());

    const config = pixel.calls.find(([kind]) => kind === "config");
    expect(config?.[2]).not.toHaveProperty("client_id");
    const [[, , params]] = eventsNamed(pixel.calls, "add_payment_info");
    expect(params).not.toHaveProperty("session_id");
  });

  test("consent default follows Shopify's customer privacy state", () => {
    const pixel = runPixel({
      privacy: { analyticsProcessingAllowed: true, marketingAllowed: false },
    });

    const consent = pixel.calls.find(([kind]) => kind === "consent");
    expect(consent).toEqual([
      "consent",
      "default",
      {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ]);
  });
});
