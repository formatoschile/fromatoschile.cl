import type { ConsentChoices } from "./consent";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_REQUIRED,
  isStandingRecord,
  parseConsentRecord,
  UNANSWERED_CHOICES,
  updateConsent,
} from "./consent";
import { readCookie } from "./cookies";
import { clearGoogleCookies } from "./googleCookies";
import { createDefaultPreferences, setCookieConsent } from "./preferences";
import type { CookieConsentPreferences } from "./types";

/**
 * The visitor's cookie choice. The banner, the settings dialog and the footer
 * link read and write through here, and hear about changes through
 * CONSENT_CHANGE_EVENT on `document`.
 *
 * `consent.ts` stays the only module that issues gtag commands; this module
 * calls it.
 */

/**
 * Fired on `document` after every choice. Listeners re-read what they need
 * (readConsentState, hasAdvertisingConsent); the event carries no detail.
 */
export const CONSENT_CHANGE_EVENT = "fc:consent-change";

export interface ConsentState {
  /** What is in force: the stored answer, or the unanswered fallback. */
  hasAnalyticsConsent: boolean;
  hasAdvertisingConsent: boolean;
  /** Whether the first-layer banner should be on screen. */
  showBanner: boolean;
}

export function readConsentState(): ConsentState {
  return consentStateFromCookie(readCookie(CONSENT_COOKIE_NAME));
}

/**
 * The same, from a raw `cookie-consent` value. Pure, so the React hook can
 * derive state from the cookie value it subscribes to — a call that reads
 * the cookie itself would be memoised by the React Compiler and go stale
 * after a choice.
 */
export function consentStateFromCookie(raw: string): ConsentState {
  const stored = parseConsentRecord(raw);

  if (isStandingRecord(stored)) {
    return {
      hasAnalyticsConsent: stored.analytics,
      hasAdvertisingConsent: stored.advertising,
      showBanner: false,
    };
  }

  // Nobody has answered. What that means is CONSENT_REQUIRED's to say: with
  // it off the banner never shows and the visitor is treated as having
  // granted both — the same fallback the bootstrap snippet sent to Google.
  return {
    hasAnalyticsConsent: UNANSWERED_CHOICES.analytics,
    hasAdvertisingConsent: UNANSWERED_CHOICES.advertising,
    showBanner: CONSENT_REQUIRED,
  };
}

/**
 * The single write path. Every choice — accept, reject, save — stores the
 * record, drops what the choice no longer allows, tells Google, and announces
 * the change, in that order and nowhere else.
 *
 * A withdrawal removes the cookies already written by Google's and Meta's
 * tags (`_ga*`, `_gcl_*`, `_fbp`, `_fbc`), which Consent Mode stops using but
 * does not delete. The site's own attribution cookies join this list when
 * they are added (tracking plan, phase 2, "Attribution").
 *
 * No reload: Consent Mode takes the choice as a dataLayer update.
 */
function applyChoice(preferences: CookieConsentPreferences): void {
  setCookieConsent(preferences);

  const choices = {
    analytics: preferences.analytics,
    advertising: preferences.advertising,
  };

  clearGoogleCookies(choices);

  updateConsent(choices);

  document.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function acceptAll(): void {
  applyChoice(createDefaultPreferences({ analytics: true, advertising: true }));
}

/**
 * An affirmative no. It writes a record, so the banner stays gone for the
 * thirty days a refusal is kept.
 */
export function rejectAll(): void {
  applyChoice(createDefaultPreferences());
}

export function savePreferences(choices: ConsentChoices): void {
  applyChoice(createDefaultPreferences(choices));
}
