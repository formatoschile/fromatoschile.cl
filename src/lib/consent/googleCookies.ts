import type { ConsentChoices } from "./consent";
import { cookieNames, expireCookie } from "./cookies";

/**
 * Google's own cookies, by the category that covers them: Analytics' `_ga`
 * and its per-property `_ga_<id>`, and the Ads click and conversion-linker
 * cookies `_gcl_*` (`_gcl_au`, `_gcl_aw`, `_gcl_dc`, …). The Meta Pixel's
 * `_fbp` and `_fbc` ride along with the advertising ones: the Pixel has no
 * Consent Mode of its own, and leaves them behind just the same.
 */
const ANALYTICS_COOKIE = /^_ga(_.+)?$/;
const ADVERTISING_COOKIE = /^(_gcl_.+|_fbp|_fbc)$/;

/** The Google cookies on this page that `choices` no longer allows. */
export function googleCookiesToClear({
  names,
  choices,
}: {
  names: readonly string[];
  choices: ConsentChoices;
}): string[] {
  return names.filter(
    (name) =>
      (!choices.analytics && ANALYTICS_COOKIE.test(name)) ||
      (!choices.advertising && ADVERTISING_COOKIE.test(name))
  );
}

/**
 * Removes Google's cookies for every category the visitor has just refused.
 *
 * Consent Mode stops Google's tags reading and writing these once the
 * category is denied, but it does not delete what is already there — and with
 * CONSENT_REQUIRED off, a visitor who refuses through the footer already has
 * them from their first page. Left alone they would sit on the device for up
 * to two years, against what the cookie policy promises a refusal does.
 *
 * Google writes them on the registrable domain (`.formatoschile.cl`), not the
 * host, so expireCookie tries every parent domain as well as host-only.
 */
export function clearGoogleCookies(choices: ConsentChoices): void {
  for (const name of googleCookiesToClear({ names: cookieNames(), choices })) {
    expireCookie(name);
  }
}
