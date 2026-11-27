import type { ConsentChoices } from "./consent";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_REQUIRED,
  isStandingRecord,
  parseConsentRecord,
  readStoredChoices,
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
 * CONSENT_CHANGE_EVENT on `document` — including choices made in another tab
 * (see subscribeToConsent).
 *
 * `consent.ts` stays the only module that issues gtag commands; this module
 * calls it.
 */

/**
 * Fired on `document` whenever what is in force may have changed: a choice in
 * this tab, or one detected from another tab. Listeners re-read what they
 * need; the event carries no detail.
 */
export const CONSENT_CHANGE_EVENT = "fc:consent-change";

/** Tabs of the site tell each other about a choice on this channel. */
const CONSENT_CHANNEL_NAME = "fc-consent";

export interface ConsentState {
  /** What is in force: the stored answer, or the unanswered fallback. */
  hasAnalyticsConsent: boolean;
  hasAdvertisingConsent: boolean;
  /** Whether the first-layer banner should be on screen. */
  shouldShowBanner: boolean;
}

/**
 * What this tab last told Google. Seeded on the first sync with what is in
 * force then — the same answer the bootstrap snippet sent at page load.
 */
let appliedChoices: ConsentChoices | null = null;

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
  const record = parseConsentRecord(raw);

  if (record && isStandingRecord({ record })) {
    return {
      hasAnalyticsConsent: record.analytics,
      hasAdvertisingConsent: record.advertising,
      shouldShowBanner: false,
    };
  }

  // Nobody has answered. What that means is CONSENT_REQUIRED's to say: with
  // it off the banner never shows and the visitor is treated as having
  // granted both — the same fallback the bootstrap snippet sent to Google.
  return {
    hasAnalyticsConsent: UNANSWERED_CHOICES.analytics,
    hasAdvertisingConsent: UNANSWERED_CHOICES.advertising,
    shouldShowBanner: CONSENT_REQUIRED,
  };
}

export function acceptAll(): void {
  applyChoice(createDefaultPreferences({ analytics: true, advertising: true }));
}

/**
 * An affirmative no. It writes a record, so the banner stays gone for as long
 * as a refusal is kept (REFUSAL_MAX_AGE).
 */
export function rejectAll(): void {
  applyChoice(createDefaultPreferences());
}

export function savePreferences(choices: ConsentChoices): void {
  applyChoice(createDefaultPreferences(choices));
}

/**
 * Listens for anything that can change what is in force, and calls
 * `onChange` after it: a choice in this tab, a choice in another tab of the
 * site (BroadcastChannel), and the tab becoming visible or focused again —
 * which also catches a stored answer that expired while the tab sat open, and
 * browsers without BroadcastChannel. The cookie jar is shared between tabs;
 * this makes each tab notice.
 *
 * Returns the unsubscribe function, as useSyncExternalStore expects.
 */
export function subscribeToConsent(onChange: () => void): () => void {
  document.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  const stopWatching = watchOtherTabs();

  return () => {
    document.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    stopWatching();
  };
}

/**
 * Re-reads the stored choice. If it differs from what this tab last told
 * Google — another tab chose, or the record lapsed — tells Google now, so
 * this tab's tags stop (or start) writing cookies without a reload. Always
 * announces CONSENT_CHANGE_EVENT, so the UI re-reads; React skips the render
 * when the cookie is unchanged.
 */
export function syncWithStoredChoice(): void {
  const choices = readStoredChoices();

  if (appliedChoices === null) {
    appliedChoices = choices;
  } else if (!isSameChoice(appliedChoices, choices)) {
    appliedChoices = choices;
    updateConsent(choices);
  }

  document.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

/**
 * The single write path. Every choice — accept, reject, save — stores the
 * record, drops what the choice no longer allows, tells Google, and announces
 * the change to this tab and the others, in that order and nowhere else.
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
  appliedChoices = choices;

  document.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  broadcastChoice();
}

let watcherCount = 0;
let stopWatchingOtherTabs: (() => void) | null = null;

/**
 * One set of listeners per tab however many subscribers there are, so a
 * choice from another tab produces one consent update, not one per listener.
 */
function watchOtherTabs(): () => void {
  watcherCount += 1;
  if (watcherCount === 1) {
    stopWatchingOtherTabs = startWatchingOtherTabs();
  }

  return () => {
    watcherCount -= 1;
    if (watcherCount === 0) {
      stopWatchingOtherTabs?.();
      stopWatchingOtherTabs = null;
    }
  };
}

function startWatchingOtherTabs(): () => void {
  syncWithStoredChoice();

  const channel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(CONSENT_CHANNEL_NAME);
  channel?.addEventListener("message", syncWithStoredChoice);

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      syncWithStoredChoice();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", syncWithStoredChoice);

  return () => {
    channel?.close();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", syncWithStoredChoice);
  };
}

/** Tells the site's other tabs a choice was made. Never fatal. */
function broadcastChoice(): void {
  if (typeof BroadcastChannel === "undefined") return;

  try {
    const channel = new BroadcastChannel(CONSENT_CHANNEL_NAME);
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel.postMessage takes no target origin; the rule is for window.postMessage
    channel.postMessage("changed");
    channel.close();
  } catch {
    // Other tabs still catch up on their next focus or visibility change.
  }
}

function isSameChoice(a: ConsentChoices, b: ConsentChoices): boolean {
  return a.analytics === b.analytics && a.advertising === b.advertising;
}
