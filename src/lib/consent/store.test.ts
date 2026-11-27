/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { UNANSWERED_CHOICES } from "./consent";
import { cookieNames } from "./cookies";
import { syncWithStoredChoice } from "./store";

/**
 * Another tab writes the shared `cookie-consent` cookie; this tab only sees it
 * when syncWithStoredChoice runs (on a BroadcastChannel message, focus or
 * visibility). These tests play the part of "this tab".
 */
const realWindow = globalThis.window;
const realDocument = globalThis.document;

let dataLayer: unknown[];
let dispatched: number;

beforeEach(() => {
  dataLayer = [];
  dispatched = 0;
  Object.assign(globalThis, {
    window: { dataLayer, location: { protocol: "https:" } },
    document: {
      cookie: "",
      dispatchEvent: () => {
        dispatched += 1;
        return true;
      },
    },
  });
});

afterEach(() => {
  Object.assign(globalThis, { window: realWindow, document: realDocument });
});

function storeInOtherTab(choices: {
  analytics: boolean;
  advertising: boolean;
}): void {
  const record = {
    necessary: true,
    ...choices,
    timestamp: new Date().toISOString(),
    version: 1,
  };
  document.cookie = `cookie-consent=${encodeURIComponent(JSON.stringify(record))}`;
}

function consentUpdates(): Record<string, string>[] {
  return dataLayer
    .map((entry) => Array.from(entry as ArrayLike<unknown>))
    .filter(([command, action]) => command === "consent" && action === "update")
    .map(([, , state]) => state as Record<string, string>);
}

describe("syncWithStoredChoice", () => {
  /**
   * One sequence, because the module remembers what this tab last told Google
   * — which is exactly the behaviour under test.
   */
  test("tells Google only when another tab's choice differs", () => {
    // First sync seeds from what is in force; nothing new to tell Google.
    syncWithStoredChoice();
    expect(consentUpdates()).toHaveLength(0);

    // Another tab rejects everything (with the banner off, from "granted").
    storeInOtherTab({ analytics: false, advertising: false });
    syncWithStoredChoice();
    expect(consentUpdates()).toEqual([
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      },
    ]);

    // Focus again with nothing changed: no second update.
    syncWithStoredChoice();
    expect(consentUpdates()).toHaveLength(1);

    // The record disappears (expired, or cleared): back to the fallback.
    document.cookie = "";
    syncWithStoredChoice();
    expect(consentUpdates()).toHaveLength(2);
    expect(consentUpdates()[1].analytics_storage).toBe(
      UNANSWERED_CHOICES.analytics ? "granted" : "denied"
    );

    // The UI is told to re-read every time, so the banner and dialog follow.
    expect(dispatched).toBe(4);
  });

  test("clears the cookies this tab's tags rewrote after another tab refused", () => {
    installCookieJar();

    // Another tab accepts; this tab catches up.
    storeInOtherTab({ analytics: true, advertising: true });
    syncWithStoredChoice();

    // This tab's tags, still granted, write their cookies…
    document.cookie = "_ga=GA1.1.1";
    document.cookie = "_gcl_au=1.1.1";
    document.cookie = "cart=abc";

    // …and then the other tab's refusal arrives.
    storeInOtherTab({ analytics: false, advertising: false });
    syncWithStoredChoice();

    const names = cookieNames();
    expect(names).not.toContain("_ga");
    expect(names).not.toContain("_gcl_au");
    expect(names).toContain("cart");
    expect(names).toContain("cookie-consent");
  });
});

/**
 * A minimal cookie jar on the mock document: reading returns
 * "name=value; …", writing sets one cookie, and Max-Age=0 deletes it.
 * Attributes other than Max-Age are ignored.
 */
function installCookieJar(): void {
  const jar = new Map<string, string>();
  Object.assign(window, {
    location: { protocol: "https:", hostname: "www.formatoschile.cl" },
  });
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () =>
      Array.from(jar, ([name, value]) => `${name}=${value}`).join("; "),
    set: (raw: string) => {
      const [pair, ...attributes] = raw.split("; ");
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator);
      const isExpired = attributes.some((attribute) =>
        /^max-age=0$/i.test(attribute)
      );
      if (isExpired) {
        jar.delete(name);
        return;
      }
      jar.set(name, pair.slice(separator + 1));
    },
  });
}
