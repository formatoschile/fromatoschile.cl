/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import type { PageSnapshot } from "./captureLanding";
import { captureLanding } from "./captureLanding";
import { LANDING_COOKIE_NAME, parseLanding } from "./landing";

/**
 * captureLanding against a fake document with a minimal cookie jar. With no
 * `cookie-consent` record, consent is the unanswered default — granted while
 * the banner is off — so the "refused" case writes a refusal record first.
 */
const realWindow = globalThis.window;
const realDocument = globalThis.document;

let jar: Map<string, string>;

beforeEach(() => {
  jar = new Map();
  Object.assign(globalThis, {
    window: { location: { protocol: "https:" } },
    document: {},
  });
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () =>
      Array.from(jar, ([name, value]) => `${name}=${value}`).join("; "),
    set: (raw: string) => {
      const [pair] = raw.split("; ");
      const separator = pair.indexOf("=");
      jar.set(pair.slice(0, separator), pair.slice(separator + 1));
    },
  });
});

afterEach(() => {
  Object.assign(globalThis, { window: realWindow, document: realDocument });
});

function page({
  href = "https://www.formatoschile.cl/?utm_source=google&gclid=abc",
  isRevisit = false,
}: Partial<PageSnapshot> = {}): PageSnapshot {
  return { href, referrer: "", isRevisit };
}

function storedLanding() {
  const raw = jar.get(LANDING_COOKIE_NAME);
  return raw ? parseLanding(decodeURIComponent(raw)) : null;
}

function refuseAdvertising() {
  const record = {
    necessary: true,
    analytics: true,
    advertising: false,
    timestamp: new Date().toISOString(),
    version: 1,
  };
  jar.set("cookie-consent", encodeURIComponent(JSON.stringify(record)));
}

describe("captureLanding", () => {
  test("stores a campaign landing", () => {
    expect(captureLanding({ page: page() })).toBe(true);
    expect(storedLanding()?.params).toEqual({
      utm_source: "google",
      gclid: "abc",
    });
  });

  test("a reload or back/forward visit does not overwrite a newer campaign", () => {
    captureLanding({
      page: page({ href: "https://www.formatoschile.cl/?utm_source=meta" }),
    });
    captureLanding({ page: page({ isRevisit: true }) });

    expect(storedLanding()?.params).toEqual({ utm_source: "meta" });
  });

  test("without advertising consent it writes nothing and says so", () => {
    refuseAdvertising();

    expect(captureLanding({ page: page() })).toBe(false);
    expect(storedLanding()).toBeNull();
  });
});
