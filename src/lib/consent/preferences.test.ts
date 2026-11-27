/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import {
  CONSENT_MAX_AGE,
  isStandingRecord,
  REJECTION_MAX_AGE,
  REPROMPT_BELOW_VERSION,
} from "./consent";
import type { StoredConsent } from "./consent";
import { createDefaultPreferences, getCookieConsent } from "./preferences";

/** The standing-record rule with the banner ON: refusals kept 30 days. */
function isValidBannerOn(record: StoredConsent | null): boolean {
  return isStandingRecord(
    record,
    REPROMPT_BELOW_VERSION,
    Date.now(),
    REJECTION_MAX_AGE
  );
}

/**
 * These read document.cookie at call time rather than at import, so a pair of
 * stub globals is enough — no DOM environment needed.
 */
const realWindow = globalThis.window;
const realDocument = globalThis.document;

function withCookie(cookie: string) {
  Object.assign(globalThis, { window: { location: { protocol: "https:" } } });
  Object.assign(globalThis, { document: { cookie } });
}

beforeEach(() => withCookie(""));

afterEach(() => {
  Object.assign(globalThis, { window: realWindow });
  Object.assign(globalThis, { document: realDocument });
});

function store(record: object): void {
  withCookie(`cookie-consent=${encodeURIComponent(JSON.stringify(record))}`);
}

describe("getCookieConsent", () => {
  test("reads a current record", () => {
    store(createDefaultPreferences({ analytics: true, advertising: true }));

    const preferences = getCookieConsent();

    expect(preferences?.analytics).toBe(true);
    expect(preferences?.advertising).toBe(true);
    expect(preferences?.version).toBe(1);
  });

  /**
   * A record with no `advertising` key must read as declined rather than as
   * undefined leaking through every call site, and one with no version is not
   * one this site wrote.
   */
  test("a record missing keys reads as declined, version 0", () => {
    store({
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    });

    const preferences = getCookieConsent();

    expect(preferences?.analytics).toBe(true);
    expect(preferences?.advertising).toBe(false);
    expect(preferences?.version).toBe(0);
  });

  test("a truthy-but-not-true value is not consent", () => {
    store({
      analytics: "yes",
      advertising: 1,
      timestamp: new Date().toISOString(),
    });

    const preferences = getCookieConsent();

    expect(preferences?.analytics).toBe(false);
    expect(preferences?.advertising).toBe(false);
  });

  test("necessary is always true, whatever the cookie claims", () => {
    store({
      necessary: false,
      analytics: false,
      timestamp: new Date().toISOString(),
    });

    expect(getCookieConsent()?.necessary).toBe(true);
  });

  test("malformed JSON is no consent, not a throw", () => {
    withCookie("cookie-consent=not%20json");

    expect(getCookieConsent()).toBeNull();
  });

  test("a record with no timestamp is not a record", () => {
    store({ necessary: true, analytics: true });

    expect(getCookieConsent()).toBeNull();
  });

  test("no cookie at all", () => {
    expect(getCookieConsent()).toBeNull();
  });

  test("finds its cookie among others", () => {
    const record = encodeURIComponent(
      JSON.stringify(createDefaultPreferences({ advertising: true }))
    );
    withCookie(`_ga=GA1.1.x; cookie-consent=${record}; _gcl_au=1.1.y`);

    expect(getCookieConsent()?.advertising).toBe(true);
  });
});

describe("createDefaultPreferences", () => {
  test("declines both categories when asked for nothing", () => {
    const preferences = createDefaultPreferences();

    expect(preferences.analytics).toBe(false);
    expect(preferences.advertising).toBe(false);
    expect(preferences.necessary).toBe(true);
  });

  test("an omitted key is a decline, not an accept", () => {
    const preferences = createDefaultPreferences({ analytics: true });

    expect(preferences.analytics).toBe(true);
    expect(preferences.advertising).toBe(false);
  });
});

describe("isStandingRecord, banner on", () => {
  test("a fresh record is valid", () => {
    expect(isValidBannerOn(createDefaultPreferences())).toBe(true);
  });

  test("an acceptance older than a year is not", () => {
    const old = createDefaultPreferences({ analytics: true });
    old.timestamp = new Date(Date.now() - 400 * 86_400_000).toISOString();

    expect(isValidBannerOn(old)).toBe(false);
  });

  /**
   * A refusal is kept for thirty days rather than a year, so the banner asks
   * again in a month. Deliberately not a day: see REJECTION_MAX_AGE.
   */
  test("a refusal lapses after thirty days so the visitor is asked again", () => {
    const refusal = createDefaultPreferences();
    refusal.timestamp = new Date(Date.now() - 31 * 86_400_000).toISOString();

    expect(isValidBannerOn(refusal)).toBe(false);
  });

  test("a refusal still stands inside the thirty days", () => {
    const refusal = createDefaultPreferences();
    refusal.timestamp = new Date(Date.now() - 20 * 86_400_000).toISOString();

    expect(isValidBannerOn(refusal)).toBe(true);
  });

  test("an acceptance of the same age is untouched by the refusal window", () => {
    const accepted = createDefaultPreferences({ analytics: true });
    accepted.timestamp = new Date(Date.now() - 90 * 86_400_000).toISOString();

    expect(isValidBannerOn(accepted)).toBe(true);
  });

  /**
   * Granting one category and refusing the other is an answer, not a refusal.
   * They engaged with the question, so it keeps the full year.
   */
  test("a partial choice is not a refusal", () => {
    const partial = createDefaultPreferences({ analytics: true });
    partial.timestamp = new Date(Date.now() - 60 * 86_400_000).toISOString();

    expect(isValidBannerOn(partial)).toBe(true);
  });

  test("null is not consent", () => {
    expect(isValidBannerOn(null)).toBe(false);
  });

  /**
   * With the banner off nobody is asked again, so a refusal made from the
   * footer must not lapse back into "granted" after a month.
   */
  test("banner off: a refusal is kept as long as an acceptance", () => {
    const refusal = createDefaultPreferences();
    refusal.timestamp = new Date(Date.now() - 200 * 86_400_000).toISOString();

    expect(
      isStandingRecord(
        refusal,
        REPROMPT_BELOW_VERSION,
        Date.now(),
        CONSENT_MAX_AGE
      )
    ).toBe(true);
  });

  /** A record with no version (read as 0) predates REPROMPT_BELOW_VERSION. */
  test("a record without a version no longer counts", () => {
    const stale = {
      ...createDefaultPreferences({ analytics: true }),
      version: 0,
    };

    expect(isValidBannerOn(stale)).toBe(false);
  });

  test("a record written today counts", () => {
    expect(isValidBannerOn(createDefaultPreferences({ analytics: true }))).toBe(
      true
    );
  });
});
