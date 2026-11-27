/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Runs the pixel source the way Shopify's lax sandbox does — `analytics`,
 * `browser`, `init` and `api` as globals — with fakes, and records every
 * gtag call it makes.
 */
const SOURCE = readFileSync(join(import.meta.dir, "ga4-checkout.js"), "utf8");

interface PixelOptions {
  cookies?: Record<string, string>;
  privacy?: Record<string, boolean>;
  /** Make browser.cookie.get reject, as a sandbox failure would. */
  isCookieReadFailing?: boolean;
  /** Leave `api` undefined, with only a bare `customerPrivacy` global. */
  hasApiGlobal?: boolean;
  /**
   * The sandbox's localStorage. Pass the same map to two pixels to simulate
   * two page loads of one visitor.
   */
  storage?: Map<string, string>;
  /** Make browser.localStorage.setItem reject. */
  isStorageWriteFailing?: boolean;
}

interface Harness {
  calls: unknown[][];
  emit: (name: string, event: unknown) => Promise<void>;
  emitTogether: (name: string, event: unknown) => Promise<void>;
  emitConsent: (event: unknown) => void;
}

interface CheckoutEventOptions {
  token?: string | null;
  orderId?: string | null;
}

interface EventsNamedOptions {
  calls: unknown[][];
  name: string;
}

type Handler = (event: unknown) => void;

/** Lets the pixel's async work (cookie reads, storage) settle. */
function settle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function runPixel({
  cookies = {},
  privacy = { analyticsProcessingAllowed: true, marketingAllowed: true },
  isCookieReadFailing = false,
  hasApiGlobal = true,
  storage = new Map<string, string>(),
  isStorageWriteFailing = false,
}: PixelOptions = {}): Harness {
  const handlers: Record<string, Handler> = {};
  let consentHandler: Handler | undefined;
  const fakeWindow: { dataLayer?: unknown[] } = {};
  const fakeDocument = {
    createElement: () => ({ setAttribute: () => {} }),
    head: { appendChild: () => {} },
  };

  const analytics = {
    subscribe: (name: string, handler: Handler) => {
      handlers[name] = handler;
    },
  };
  const browser = {
    cookie: {
      get: async (name: string) => {
        if (isCookieReadFailing) throw new Error("cookie read failed");
        return cookies[name] ?? "";
      },
    },
    localStorage: {
      getItem: async (key: string) => storage.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        if (isStorageWriteFailing) throw new Error("storage write failed");
        storage.set(key, value);
      },
    },
  };
  const init = { customerPrivacy: privacy };
  const customerPrivacy = {
    subscribe: (_name: string, handler: Handler) => {
      consentHandler = handler;
    },
  };
  const api = hasApiGlobal ? { customerPrivacy } : undefined;

  // oxlint-disable-next-line no-new-func -- executing the pixel as Shopify does
  new Function(
    "analytics",
    "browser",
    "init",
    "api",
    "customerPrivacy",
    "window",
    "document",
    SOURCE
  )(analytics, browser, init, api, customerPrivacy, fakeWindow, fakeDocument);

  return {
    get calls() {
      return (fakeWindow.dataLayer ?? []).map((entry) =>
        Array.from(entry as ArrayLike<unknown>)
      );
    },
    emit: async (name, event) => {
      handlers[name]?.(event);
      await settle();
    },
    emitTogether: async (name, event) => {
      handlers[name]?.(event);
      handlers[name]?.(event);
      await settle();
    },
    emitConsent: (event) => consentHandler?.(event),
  };
}

function checkoutEvent({
  token = "tok-1",
  orderId = null,
}: CheckoutEventOptions = {}) {
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
        order: { id: orderId },
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

function eventsNamed({ calls, name }: EventsNamedOptions) {
  return calls.filter(([kind, event]) => kind === "event" && event === name);
}

function configCall(calls: unknown[][]) {
  return calls.find(([kind]) => kind === "config");
}

const COOKIES = {
  _ga: "GA1.1.123456789.1700000000",
  _ga_JTP6VGESGM: "GS2.1.s1764240000$o3$g1$t1764240100$j60$l0$h0",
};

describe("GA4 checkout pixel", () => {
  test("configures gtag with the site's client and session IDs, storing nothing", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    await pixel.emit("checkout_started", checkoutEvent());

    expect(configCall(pixel.calls)).toEqual([
      "config",
      "G-JTP6VGESGM",
      {
        send_page_view: false,
        client_storage: "none",
        client_id: "123456789.1700000000",
        session_id: "1764240000",
      },
    ]);
  });

  test("begin_checkout carries the real URL and items, not session_id as a parameter", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    await pixel.emit("checkout_started", checkoutEvent());

    const [[, , params]] = eventsNamed({
      calls: pixel.calls,
      name: "begin_checkout",
    });
    expect(params).not.toHaveProperty("session_id");
    expect(params).toMatchObject({
      send_to: "G-JTP6VGESGM",
      currency: "CLP",
      value: 14990,
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
      cookies: {
        ...COOKIES,
        _ga_JTP6VGESGM: "GS1.1.1764240000.3.1.1764240100.0.0.0",
      },
    });
    await pixel.emit("checkout_started", checkoutEvent());

    expect(configCall(pixel.calls)?.[2]).toHaveProperty(
      "session_id",
      "1764240000"
    );
  });

  test("re-entering the same checkout sends begin_checkout once", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    await pixel.emit("checkout_started", checkoutEvent());
    await pixel.emit("checkout_started", checkoutEvent());

    expect(
      eventsNamed({ calls: pixel.calls, name: "begin_checkout" })
    ).toHaveLength(1);
  });

  test("two copies arriving together still send once", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    await pixel.emitTogether("checkout_started", checkoutEvent());

    expect(
      eventsNamed({ calls: pixel.calls, name: "begin_checkout" })
    ).toHaveLength(1);
  });

  test("purchase has transaction ID, IVA-inclusive value and tax, once", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    const completed = checkoutEvent({ orderId: "gid://shopify/Order/5551" });
    await pixel.emit("checkout_completed", completed);
    await pixel.emit("checkout_completed", completed);

    const purchases = eventsNamed({ calls: pixel.calls, name: "purchase" });
    expect(purchases).toHaveLength(1);
    expect(purchases[0][2]).toMatchObject({
      transaction_id: "5551",
      value: 14990,
      tax: 2393,
      currency: "CLP",
    });
  });

  test("purchase without an order ID falls back to the checkout token, once", async () => {
    const pixel = runPixel({ cookies: COOKIES });
    const completed = checkoutEvent({ token: "tok-9", orderId: null });
    await pixel.emit("checkout_completed", completed);
    await pixel.emit("checkout_completed", completed);

    const purchases = eventsNamed({ calls: pixel.calls, name: "purchase" });
    expect(purchases).toHaveLength(1);
    expect(purchases[0][2]).toHaveProperty("transaction_id", "tok-9");
  });

  test("a later load with the order ID does not send the purchase again", async () => {
    const storage = new Map<string, string>();
    const firstLoad = runPixel({ cookies: COOKIES, storage });
    await firstLoad.emit(
      "checkout_completed",
      checkoutEvent({ orderId: null })
    );
    const secondLoad = runPixel({ cookies: COOKIES, storage });
    await secondLoad.emit(
      "checkout_completed",
      checkoutEvent({ orderId: "gid://shopify/Order/5551" })
    );

    expect(
      eventsNamed({ calls: firstLoad.calls, name: "purchase" })
    ).toHaveLength(1);
    expect(
      eventsNamed({ calls: secondLoad.calls, name: "purchase" })
    ).toHaveLength(0);
  });

  test("reloading the thank-you page does not send the purchase again", async () => {
    const storage = new Map<string, string>();
    const completed = checkoutEvent({ orderId: "gid://shopify/Order/5551" });
    const firstLoad = runPixel({ cookies: COOKIES, storage });
    await firstLoad.emit("checkout_completed", completed);
    const secondLoad = runPixel({ cookies: COOKIES, storage });
    await secondLoad.emit("checkout_completed", completed);

    expect(
      eventsNamed({ calls: firstLoad.calls, name: "purchase" })
    ).toHaveLength(1);
    expect(
      eventsNamed({ calls: secondLoad.calls, name: "purchase" })
    ).toHaveLength(0);
  });

  test("an event whose send was never recorded goes out on the next load", async () => {
    const storage = new Map<string, string>();
    const firstLoad = runPixel({
      cookies: COOKIES,
      storage,
      isStorageWriteFailing: true,
    });
    await firstLoad.emit("checkout_started", checkoutEvent());
    const secondLoad = runPixel({ cookies: COOKIES, storage });
    await secondLoad.emit("checkout_started", checkoutEvent());

    expect(
      eventsNamed({ calls: firstLoad.calls, name: "begin_checkout" })
    ).toHaveLength(1);
    expect(
      eventsNamed({ calls: secondLoad.calls, name: "begin_checkout" })
    ).toHaveLength(1);
  });

  test("without GA cookies it still sends, with no client or session ID", async () => {
    const pixel = runPixel();
    await pixel.emit("payment_info_submitted", checkoutEvent());

    const config = configCall(pixel.calls)?.[2];
    expect(config).not.toHaveProperty("client_id");
    expect(config).not.toHaveProperty("session_id");
    expect(
      eventsNamed({ calls: pixel.calls, name: "add_payment_info" })
    ).toHaveLength(1);
  });

  test("a failing cookie read does not stop the events", async () => {
    const pixel = runPixel({ isCookieReadFailing: true });
    await pixel.emit("checkout_started", checkoutEvent());

    expect(configCall(pixel.calls)?.[2]).not.toHaveProperty("client_id");
    expect(
      eventsNamed({ calls: pixel.calls, name: "begin_checkout" })
    ).toHaveLength(1);
  });

  test("works when the sandbox has no `api` global", async () => {
    const pixel = runPixel({ cookies: COOKIES, hasApiGlobal: false });
    await pixel.emit("checkout_started", checkoutEvent());

    expect(
      eventsNamed({ calls: pixel.calls, name: "begin_checkout" })
    ).toHaveLength(1);
  });

  test("consent default follows Shopify's customer privacy state", () => {
    const pixel = runPixel({
      privacy: { analyticsProcessingAllowed: true, marketingAllowed: false },
    });

    expect(pixel.calls.find(([kind]) => kind === "consent")).toEqual([
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

  test("a consent event without privacy data changes nothing", () => {
    const pixel = runPixel();
    pixel.emitConsent({});
    pixel.emitConsent({
      customerPrivacy: {
        analyticsProcessingAllowed: false,
        marketingAllowed: false,
      },
    });

    const updates = pixel.calls.filter(
      ([kind, action]) => kind === "consent" && action === "update"
    );
    expect(updates).toHaveLength(1);
    expect(updates[0][2]).toHaveProperty("analytics_storage", "denied");
  });
});
