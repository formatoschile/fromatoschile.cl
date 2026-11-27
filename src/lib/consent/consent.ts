/**
 * Google Consent Mode v2: the visitor's cookie choice, in the form Google
 * understands.
 *
 * Ported from rkabogados.cl, where it is live and verified; the reasoning
 * below is theirs and still holds. Plan: docs/plans/tracking-plan.md phase 3,
 * runbook: docs/plans/consent-mode-runbook.md.
 *
 * This is the only file that issues gtag commands, and the bootstrap snippet
 * below (inlined in src/app/layout.tsx) is the first thing on every page to
 * touch `window.dataLayer`. The other writer is trackEvent in
 * src/lib/analytics (every event in docs/tracking-events.md), plus Tag
 * Manager's own start event once it loads.
 *
 * It also owns the `cookie-consent` record's format and the rule for whether a
 * stored record still counts, because every reader has to agree on it: the
 * snippet (Google's default), readStoredChoices, and the banner's store
 * (./store.ts).
 *
 * Two things make the implementation less obvious than the usual recipe.
 *
 * First, `window.gtag` does not exist here. The Google tag is loaded
 * *through* GTM, which keeps the gtag API internal, so there is no
 * `gtag()` to call — consent commands have to be pushed onto the dataLayer
 * ourselves, in the shape gtag.js would have pushed them.
 *
 * Second, that shape is an `arguments` object, not an array. GTM tells a
 * *command* from a *data push* by checking `arguments`-ness, so
 * `dataLayer.push(["consent", "default", {...}])` with a real array is merged
 * into the data model and silently ignored as a command. Nothing throws,
 * nothing logs, and Tag Assistant simply shows no consent state. Rest
 * parameters (`...args`) build an Array too, so `gtag` below has to be a
 * non-arrow function reaching for `arguments`.
 */

import { readCookie } from "./cookies";

/** The seven storage types Consent Mode v2 defines. */
export interface ConsentModeState {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  analytics_storage: ConsentValue;
  functionality_storage: ConsentValue;
  personalization_storage: ConsentValue;
  security_storage: ConsentValue;
}

export type ConsentValue = "granted" | "denied";

/** The two categories the banner actually asks about. */
export interface ConsentChoices {
  analytics: boolean;
  advertising: boolean;
}

/** The subset a visitor's choice can move. The other three never change. */
type MutableConsentState = Pick<
  ConsentModeState,
  "ad_storage" | "ad_user_data" | "ad_personalization" | "analytics_storage"
>;

type GtagCommand =
  | ["consent", "default", ConsentModeState]
  | ["consent", "update", MutableConsentState]
  | ["set", "url_passthrough" | "ads_data_redaction", boolean];

/** The cookie the banner and the settings dialog write. */
export const CONSENT_COOKIE_NAME = "cookie-consent";

/**
 * Records below this version are treated as no consent at all: the banner
 * comes back and Google is told nothing was granted. Raise it (together with
 * CONSENT_VERSION in ./preferences.ts) when the categories or the policy
 * change enough that earlier answers no longer cover what we do.
 */
export const REPROMPT_BELOW_VERSION = 1;

/** A record with no `version` is not one this site wrote. */
export const LEGACY_CONSENT_VERSION = 0;

/**
 * Whether the site asks for consent before tracking. `false` until Ley 21.719
 * takes effect on 15 October 2027 (Ley 21.855); decided 25 and 27 November
 * 2026, reasoning in docs/plans/tracking-plan.md phase 3.
 *
 * Off: the first-layer banner never shows, and a visitor who has not answered
 * is treated as having granted both categories — the Consent Mode default
 * goes out granted. Unlike RK, the settings dialog stays reachable from the
 * footer's "Configurar cookies", so anyone can still opt out; a record saved
 * that way is honoured to the letter, flag or no flag.
 *
 * To switch on: set this to `true` and deploy (planned for 14 October 2027).
 * Nothing else. The banner appears for unanswered visitors and defaults go
 * back to denied.
 */
export const CONSENT_REQUIRED = false;

/**
 * What a visitor who has not answered is taken to have said.
 *
 * The single place the flag turns into consent. All three readers — the
 * snippet, readStoredChoices, and readConsentState — fall back to this and to
 * nothing else, which is what keeps them from disagreeing.
 */
export const UNANSWERED_CHOICES: ConsentChoices = CONSENT_REQUIRED
  ? { analytics: false, advertising: false }
  : { analytics: true, advertising: true };

const DAY = 24 * 60 * 60;

/** How long a record that grants something is kept, in seconds. */
export const CONSENT_MAX_AGE = 365 * DAY;

/**
 * How long a record that grants nothing is kept, before the visitor is asked
 * again. Shorter than an acceptance so a refusal is not held for a year, but
 * not so short that the question becomes a daily toll (RK's reasoning,
 * kept). The only place it is written.
 */
export const REJECTION_MAX_AGE = 30 * DAY;

/**
 * How long a refusal is actually kept. Thirty days only while the banner is
 * on, because only then is the visitor asked again when it lapses. With
 * CONSENT_REQUIRED off nobody is asked again: a lapsed refusal would fall back
 * to "granted" silently, so a month after opting out from the footer tracking
 * would resume. Off, a refusal is kept as long as any other answer.
 */
export const REFUSAL_MAX_AGE = CONSENT_REQUIRED
  ? REJECTION_MAX_AGE
  : CONSENT_MAX_AGE;

/**
 * How long a record with these choices lives. A partial choice — analytics
 * yes, advertising no — is not a refusal and keeps the full year.
 * `refusalMaxAge` is a parameter only so tests can exercise both flag
 * positions; callers never pass it.
 */
export function consentMaxAge(
  choices: ConsentChoices,
  refusalMaxAge: number = REFUSAL_MAX_AGE
): number {
  return choices.analytics || choices.advertising
    ? CONSENT_MAX_AGE
    : refusalMaxAge;
}

/** The `cookie-consent` record, as read back from the cookie. */
export interface StoredConsent extends ConsentChoices {
  /** ISO time of the choice. */
  timestamp: string;
  version: number;
}

/**
 * Turns the raw cookie value into a record, or null if it is not one.
 *
 * `=== true`, not truthiness: a record written before the advertising
 * category existed has no such key, and it reads as declined until the
 * visitor chooses again. The bootstrap snippet applies the same rule — change
 * both together; a test runs the snippet against this.
 */
export function parseConsentRecord(raw: string): StoredConsent | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;

    const record = value as Record<string, unknown>;
    if (typeof record.timestamp !== "string") return null;

    return {
      analytics: record.analytics === true,
      advertising: record.advertising === true,
      timestamp: record.timestamp,
      version:
        typeof record.version === "number"
          ? record.version
          : LEGACY_CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

/** The stored record, or null when there is none or it cannot be read. */
export function readConsentRecord(): StoredConsent | null {
  if (typeof document === "undefined") return null;

  return parseConsentRecord(readCookie(CONSENT_COOKIE_NAME));
}

/**
 * Whether a stored answer still stands: from a shape we still honour, and
 * younger than its own lifetime. The browser drops the cookie at the same
 * boundary, so the age check mostly guards against clock skew — and against
 * records written before refusals got their shorter lifetime.
 *
 * The one rule every reader applies. The snippet mirrors it in ES5.
 */
export function isStandingRecord(
  record: StoredConsent | null,
  repromptBelow: number = REPROMPT_BELOW_VERSION,
  now: number = Date.now(),
  refusalMaxAge: number = REFUSAL_MAX_AGE
): record is StoredConsent {
  if (!record || record.version < repromptBelow) return false;

  const written = Date.parse(record.timestamp);
  if (Number.isNaN(written)) return false;

  return (now - written) / 1000 < consentMaxAge(record, refusalMaxAge);
}

/**
 * Advertising consent from a raw `cookie-consent` value (e.g. a request's
 * cookie header on the server): the same standing-record rule and the same
 * unanswered fallback as every browser reader. For the attribution cart
 * attributes (tracking plan, phase 2), which are written server-side.
 */
export function advertisingConsentFromCookie(raw: string | undefined): boolean {
  const record = parseConsentRecord(raw ?? "");

  return isStandingRecord(record)
    ? record.advertising
    : UNANSWERED_CHOICES.advertising;
}

/**
 * Marks the defaults as sent, so the snippet and `ensureConsentDefaults` can
 * both run without double-pushing. Whichever gets there first wins.
 */
const CONSENT_READY_FLAG = "__fcConsentDefaults";

function grant(allowed: boolean): ConsentValue {
  return allowed ? "granted" : "denied";
}

/**
 * The category-to-storage-type mapping, in one place.
 *
 * All seven types are declared, including the three no choice moves. An
 * *undeclared* type behaves as granted, which is the trap: listing only the
 * four the banner controls would leave the rest silently permissive.
 *
 * `functionality_storage` and `security_storage` are what the banner already
 * calls "necesarias" — the consent cookie itself and the cart.
 * `personalization_storage` covers
 * personalised *content*, which this site does not do, so denying it is both
 * truthful and the conservative reading.
 */
export function consentStateFrom(choices: ConsentChoices): ConsentModeState {
  return {
    ad_storage: grant(choices.advertising),
    ad_user_data: grant(choices.advertising),
    ad_personalization: grant(choices.advertising),
    analytics_storage: grant(choices.analytics),
    functionality_storage: "granted",
    personalization_storage: "denied",
    security_storage: "granted",
  };
}

const gtag: (...command: GtagCommand) => void = function () {
  window.dataLayer = window.dataLayer || [];
  // oxlint-disable-next-line prefer-rest-params -- GTM reads the arguments
  // object itself; an array is not a command. See the file header.
  window.dataLayer.push(arguments);
};

/**
 * What the visitor has effectively chosen: their stored answer if it still
 * stands, otherwise the unanswered fallback — the same thing the snippet told
 * Google at page load.
 *
 * `repromptBelow` and `unanswered` are parameters only so the version gate
 * and the banner-less mode can be tested without editing the constants;
 * callers never pass either.
 */
export function readStoredChoices(
  repromptBelow: number = REPROMPT_BELOW_VERSION,
  unanswered: ConsentChoices = UNANSWERED_CHOICES
): ConsentChoices {
  const record = readConsentRecord();

  return isStandingRecord(record, repromptBelow)
    ? { analytics: record.analytics, advertising: record.advertising }
    : unanswered;
}

/** Whether Google — and we — may write advertising identifiers (client side). */
export function hasAdvertisingConsent(): boolean {
  return readStoredChoices().advertising;
}

/**
 * The defaults, sent once per page load before anything can trigger a tag.
 *
 * Idempotent, and in practice always a no-op: the inline snippet below runs
 * first on every page. This is a guard against a setup the site does not have
 * today — a Content-Security-Policy added without the snippet's hash, or an
 * extension that strips inline scripts — so that even then the defaults reach
 * the dataLayer before the first event and before Tag Manager's start event.
 * Cheap enough to keep; trackEvent calls it before every push.
 *
 * There is no `wait_for_update`. It exists for consent platforms that load
 * asynchronously and answer a beat later; this one reads the cookie
 * synchronously and sends the right default first time, so waiting would delay
 * every tag for every undecided visitor and buy nothing.
 *
 * No `region` targeting either: one global default, driven by
 * CONSENT_REQUIRED, is simpler to reason about than per-region ones.
 */
export function ensureConsentDefaults(): void {
  if (typeof window === "undefined") {
    return;
  }

  const flagged = window as unknown as Record<string, unknown>;
  if (flagged[CONSENT_READY_FLAG]) {
    return;
  }
  flagged[CONSENT_READY_FLAG] = 1;

  gtag("consent", "default", consentStateFrom(readStoredChoices()));
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);
}

/**
 * The visitor has just chosen. Moves the four types a choice can move.
 *
 * Consent Mode does not replay: events already in the dataLayer went out under
 * whatever state was in force when GTM processed them. That is expected — the
 * landing page view of a first-time visitor is a cookieless ping, and only
 * what follows the choice carries an identifier.
 */
export function updateConsent(choices: ConsentChoices): void {
  if (typeof window === "undefined") {
    return;
  }

  const state = consentStateFrom(choices);

  gtag("consent", "update", {
    ad_storage: state.ad_storage,
    ad_user_data: state.ad_user_data,
    ad_personalization: state.ad_personalization,
    analytics_storage: state.analytics_storage,
  });
}

/**
 * The same thing again, as a string, for the root layout to inline.
 *
 * This is the copy that actually runs in production. It has to exist
 * separately because everything above is bundled client code, which runs only
 * after hydration — by which point components may already have pushed events.
 * GTM replays the dataLayer in order, and an undeclared consent type behaves
 * as granted, so an event ahead of the default would be processed
 * unrestricted. An inline classic script in `<head>` is the only way the
 * default is guaranteed to be first.
 *
 * ES5 only — no optional chaining, no const. Kept in sync with
 * consentStateFrom and isStandingRecord by tests
 * (./consent.test.ts) that execute this string and compare the result,
 * because two implementations of one rule drift.
 *
 * Written readably and collapsed once at module load. It ships in the HTML of
 * every page, so the indentation is worth removing.
 *
 * Every statement here is semicolon-terminated, so collapsing whitespace is
 * safe. The one significant space, in `(?:^|; )`, survives as a single space.
 *
 * The two literals are hoisted into `G` and `N` rather than written out at
 * each of the seven storage types, which every page would pay for.
 *
 * A stored record is read as written — `a = ... ? G : N`, not `if (...) a = G`.
 * Upgrading from the fallback was correct only while the fallback was denied;
 * with CONSENT_REQUIRED off it would have left someone who rejected through
 * the footer panel granted anyway, which is the one thing the opt-out has to
 * survive.
 */
function compact(source: string): string {
  return source.replace(/\s+/g, " ").trim();
}

/**
 * Exported as a builder so the version gate and the unanswered fallback can be
 * tested at values other than the live ones — which is what keeps `bun test`
 * green whichever way CONSENT_REQUIRED is set, so that flipping it back stays
 * a one-line change. Production uses CONSENT_BOOTSTRAP_SNIPPET.
 */
export function buildConsentBootstrapSnippet(
  repromptBelow: number,
  unanswered: ConsentChoices = UNANSWERED_CHOICES
): string {
  return compact(`
(function () {
  var w = window;
  if (w.${CONSENT_READY_FLAG}) return;
  w.${CONSENT_READY_FLAG} = 1;
  w.dataLayer = w.dataLayer || [];
  function g() { w.dataLayer.push(arguments); }
  var G = 'granted', N = 'denied';
  var a = ${unanswered.analytics ? "G" : "N"}, d = ${unanswered.advertising ? "G" : "N"};
  try {
    var m = document.cookie.match(/(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)/);
    if (m) {
      var p = JSON.parse(decodeURIComponent(m[1]));
      var v = typeof p.version === 'number' ? p.version : ${LEGACY_CONSENT_VERSION};
      var pa = p.analytics === true, pd = p.advertising === true;
      var t = typeof p.timestamp === 'string' ? Date.parse(p.timestamp) : NaN;
      if (v >= ${repromptBelow} && (Date.now() - t) / 1000 < (pa || pd ? ${CONSENT_MAX_AGE} : ${REFUSAL_MAX_AGE})) {
        a = pa ? G : N;
        d = pd ? G : N;
      }
    }
  } catch (e) {}
  g('consent', 'default', {
    ad_storage: d,
    ad_user_data: d,
    ad_personalization: d,
    analytics_storage: a,
    functionality_storage: G,
    personalization_storage: N,
    security_storage: G
  });
  g('set', 'ads_data_redaction', true);
  g('set', 'url_passthrough', true);
})();
`);
}

export const CONSENT_BOOTSTRAP_SNIPPET = buildConsentBootstrapSnippet(
  REPROMPT_BELOW_VERSION
);
