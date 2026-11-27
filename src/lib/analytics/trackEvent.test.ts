/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { ANALYTICS_EVENTS, CHECKOUT_ROUTES, LOCATIONS } from "./events";
import { toEcommerce } from "./items";
import type { AnalyticsItem } from "./items";
import { trackEvent } from "./trackEvent";

const ITEM: AnalyticsItem = {
  item_id: "123",
  item_name: "Contrato de trabajo",
  item_category: "laboral",
  price: 9990,
  quantity: 1,
};

/**
 * A page where the inline consent snippet has already run (its flag is set),
 * as on every real page — so these tests see only trackEvent's own pushes.
 */
function setWindow(pathname: string): unknown[] {
  const dataLayer: unknown[] = [];
  Object.assign(globalThis, {
    window: {
      dataLayer,
      location: { pathname, href: `https://www.formatoschile.cl${pathname}` },
      __fcConsentDefaults: 1,
    },
  });
  return dataLayer;
}

describe("trackEvent", () => {
  let dataLayer: unknown[];

  beforeEach(() => {
    dataLayer = setWindow("/product/contrato");
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  test("pushes the event with page_type and every label reset", () => {
    trackEvent({
      event: ANALYTICS_EVENTS.checkoutClick,
      labels: { route: CHECKOUT_ROUTES.buyNow, location: LOCATIONS.card },
    });

    expect(dataLayer).toEqual([
      {
        event: "fc_checkout_click",
        page_type: "product",
        page_location: "https://www.formatoschile.cl/product/contrato",
        location: "card",
        route: "buy_now",
        preview_page: undefined,
        error_reason: undefined,
        search_term: undefined,
        search_results: undefined,
        ecommerce: null,
      },
    ]);
  });

  test("a later event clears labels set by an earlier one", () => {
    trackEvent({
      event: ANALYTICS_EVENTS.checkoutClick,
      labels: { route: CHECKOUT_ROUTES.cart },
    });
    trackEvent({ event: ANALYTICS_EVENTS.previewOpen });

    const second = dataLayer[1] as Record<string, unknown>;
    expect(second).toHaveProperty("route", undefined);
    expect(second.event).toBe("fc_preview_open");
  });

  test("ecommerce events clear the previous ecommerce object first", () => {
    trackEvent({
      event: ANALYTICS_EVENTS.addToCart,
      ecommerce: toEcommerce({ items: [ITEM] }),
    });

    expect(dataLayer[0]).toEqual({ ecommerce: null });
    expect(dataLayer[1]).toMatchObject({
      event: "add_to_cart",
      ecommerce: { currency: "CLP", value: 9990, items: [ITEM] },
    });
  });

  test("non-ecommerce events push once and clear ecommerce", () => {
    trackEvent({ event: ANALYTICS_EVENTS.contactClick });

    expect(dataLayer).toHaveLength(1);
    expect(dataLayer[0]).toHaveProperty("ecommerce", null);
  });

  /**
   * Without the inline snippet (blocked, or a test page), the first event
   * still cannot go out ahead of the Consent Mode default.
   */
  test("sends the consent default first when the snippet did not", () => {
    Object.assign(globalThis, { window: { location: { pathname: "/" } } });

    trackEvent({ event: ANALYTICS_EVENTS.contactClick });

    const { window: fakeWindow } = globalThis as unknown as {
      window: { dataLayer: unknown[] };
    };
    const [first] = fakeWindow.dataLayer as ArrayLike<unknown>[];
    expect(Array.from(first).slice(0, 2)).toEqual(["consent", "default"]);
    expect(fakeWindow.dataLayer.at(-1)).toMatchObject({
      event: "fc_contact_click",
    });
  });

  test("is a no-op on the server", () => {
    Reflect.deleteProperty(globalThis, "window");

    expect(() =>
      trackEvent({ event: ANALYTICS_EVENTS.contactClick })
    ).not.toThrow();
  });
});
