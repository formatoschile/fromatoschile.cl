import {
  CONSENT_COOKIE_NAME,
  consentMaxAge,
  readConsentRecord,
} from "./consent";
import { writeCookie } from "./cookies";
import type { CookieConsentPreferences } from "./types";

/**
 * The shape records are written in today. Which older shapes still count is
 * REPROMPT_BELOW_VERSION in ./consent.ts, so that raising it
 * re-prompts every reader at once.
 */
const CONSENT_VERSION = 1;

/**
 * The stored record, or null if there is none. The parsing — including why
 * `advertising` must be `=== true` — lives in parseConsentRecord, shared with
 * the site's own cookie gate.
 */
export function getCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  const record = readConsentRecord();

  return record ? { necessary: true, ...record } : null;
}

/** Stores the visitor's choice, for a year or — a refusal — thirty days. */
export function setCookieConsent(preferences: CookieConsentPreferences): void {
  if (typeof window === "undefined") return;

  writeCookie({
    name: CONSENT_COOKIE_NAME,
    value: JSON.stringify(preferences),
    maxAgeSeconds: consentMaxAge({ choices: preferences }),
  });
}

/**
 * Create default consent preferences.
 *
 * An options object rather than positional booleans: with two categories,
 * `createDefaultPreferences(true, false)` says nothing about which is which,
 * and a third would make it worse. Both default to declined.
 */
export function createDefaultPreferences({
  analytics = false,
  advertising = false,
}: {
  analytics?: boolean;
  advertising?: boolean;
} = {}): CookieConsentPreferences {
  return {
    necessary: true,
    analytics,
    advertising,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
}
