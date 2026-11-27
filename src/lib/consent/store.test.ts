/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { UNANSWERED_CHOICES } from "./consent";
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
});
