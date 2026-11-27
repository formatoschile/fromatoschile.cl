import { hasAdvertisingConsent } from "@/lib/consent/consent";
import { readCookie, writeCookie } from "@/lib/consent/cookies";

import {
  LANDING_COOKIE_NAME,
  LANDING_MAX_AGE_SECONDS,
  landingFromLocation,
  mergeLanding,
  parseLanding,
  serializeLanding,
} from "./landing";

/**
 * The page as it was when it loaded. Taken once, at load, so a capture that
 * waits for consent (the visitor answers the banner later) still records the
 * URL and referrer they arrived with.
 */
export interface PageSnapshot {
  href: string;
  referrer: string;
  /** A reload or back/forward visit: not a new arrival. */
  isRevisit: boolean;
}

export function snapshotPage(): PageSnapshot {
  return {
    href: window.location.href,
    referrer: document.referrer,
    isRevisit: isRevisitNavigation(),
  };
}

/**
 * Records `page` as the visitor's landing, per the merge rule in ./landing.ts,
 * into the `fc_landing` cookie. Browser only.
 *
 * Returns whether advertising consent allowed it to run (even if nothing
 * needed writing), so the caller knows not to try again for this page load.
 * Without consent nothing is written; what an earlier grant stored is removed
 * by the refusal itself (clearGoogleCookies), not here.
 *
 * A reload or back/forward visit is skipped: going back to a page whose URL
 * still carries an old campaign must not overwrite a newer one.
 */
export function captureLanding({ page }: { page: PageSnapshot }): boolean {
  if (!hasAdvertisingConsent()) return false;
  if (page.isRevisit) return true;

  const incoming = landingFromLocation({
    href: page.href,
    referrer: page.referrer,
    now: new Date(),
  });
  if (!incoming) return true;

  const next = mergeLanding({
    stored: parseLanding(readCookie(LANDING_COOKIE_NAME)),
    incoming,
  });
  if (!next) return true;

  writeCookie({
    name: LANDING_COOKIE_NAME,
    value: serializeLanding(next),
    maxAgeSeconds: LANDING_MAX_AGE_SECONDS,
  });
  return true;
}

function isRevisitNavigation(): boolean {
  try {
    const [entry] = performance.getEntriesByType("navigation");
    const type = (entry as PerformanceNavigationTiming | undefined)?.type;
    return type === "reload" || type === "back_forward";
  } catch {
    return false;
  }
}
