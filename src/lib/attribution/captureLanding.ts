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
 * Records this page load as the visitor's landing, per the merge rule in
 * ./landing.ts, into the `fc_landing` cookie. Browser only; call once per
 * full page load (client-side navigations are not landings).
 *
 * Without advertising consent nothing is written. What an earlier grant
 * stored is removed by the refusal itself (clearGoogleCookies), not here.
 */
export function captureLanding(): void {
  if (!hasAdvertisingConsent()) return;

  const incoming = landingFromLocation({
    href: window.location.href,
    referrer: document.referrer,
    now: new Date(),
  });
  if (!incoming) return;

  const next = mergeLanding({
    stored: parseLanding(readCookie(LANDING_COOKIE_NAME)),
    incoming,
  });
  if (!next) return;

  writeCookie({
    name: LANDING_COOKIE_NAME,
    value: serializeLanding(next),
    maxAgeSeconds: LANDING_MAX_AGE_SECONDS,
  });
}
