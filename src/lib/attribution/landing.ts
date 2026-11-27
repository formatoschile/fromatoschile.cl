/**
 * The campaign that brought a visitor, carried to their Shopify order as
 * underscore-prefixed cart attributes (tracking plan, phase 2,
 * "Attribution"). Every order then names its campaign in Shopify admin,
 * independently of GA4 — and it is what the dashboard's "orders by campaign"
 * reads (phase 6).
 *
 * Pure: the browser (capturing the landing into the `fc_landing` cookie) and
 * the server actions (turning that cookie into cart attributes on
 * `cartCreate`) share it.
 *
 * Merge rule — "last campaign touch":
 *   - a landing that carries campaign parameters (any `utm_*` or click ID)
 *     replaces whatever is stored;
 *   - a bare landing (no parameters) is stored only when nothing is, so an
 *     organic first visit is recorded, but never overwrites a campaign: a
 *     visitor who clicked an ad on Monday and comes back by typing the URL on
 *     Wednesday is still credited to the ad.
 *
 * Kept for LANDING_MAX_AGE_SECONDS, and only with advertising consent: the
 * capture checks it in the browser, the server checks it again before
 * attaching anything, and a refusal deletes the cookie with the other
 * advertising cookies (src/lib/consent/googleCookies.ts) and blanks the
 * attributes already on the cart (forgetCampaign, src/components/cart).
 *
 * Values are capped at MAX_VALUE_LENGTH code points when captured and again
 * when attached (never splitting an emoji), and the cookie is shrunk to fit
 * the browser's ~4 KB limit, so a long URL can never silently fail to write
 * and leave an older campaign in place.
 */

/** The browser cookie holding the stored landing (JSON). */
export const LANDING_COOKIE_NAME = "fc_landing";

/** 30 days: a typical consideration window, and the cart cookie's lifetime. */
export const LANDING_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Per-value cap, in code points: short enough for any order attribute. */
const MAX_VALUE_LENGTH = 255;

/**
 * Longest URI-encoded cookie value we write: under the browser's 4096-byte
 * limit for name + value + attributes, with room to spare.
 */
const MAX_COOKIE_VALUE_LENGTH = 3800;

/** Caps tried, longest first, until the encoded cookie fits. */
const COOKIE_VALUE_CAPS = [MAX_VALUE_LENGTH, 100, 40, 20];

/**
 * Hosts that are part of the purchase journey, not a source: the site and its
 * checkout subdomain, and Shopify's own checkout and Shop Pay hosts. The
 * current host (localhost, a preview URL) is added at runtime.
 */
const INTERNAL_HOST_SUFFIXES = [
  "formatoschile.cl",
  "shop.app",
  "myshopify.com",
];

/** URL parameters that mark a campaign landing, in attribute order. */
const CAMPAIGN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
] as const;

type CampaignParam = (typeof CAMPAIGN_PARAMS)[number];

/** Every attribute key this module writes, for blanking them on refusal. */
export const CAMPAIGN_ATTRIBUTE_KEYS = [
  "_landing",
  "_referrer",
  "_landed_at",
  ...CAMPAIGN_PARAMS.map((name) => `_${name}`),
];

export interface LandingContext {
  /** Path of the landing page, without query string or hash. */
  landing: string;
  /** External referrer, origin + path only; absent for direct or internal. */
  referrer?: string;
  /** ISO timestamp of the landing. */
  landedAt: string;
  /** Campaign parameters present on the landing URL. */
  params: Partial<Record<CampaignParam, string>>;
}

export interface CartAttribute {
  key: string;
  value: string;
}

/** The landing described by a page URL and its `document.referrer`. */
export function landingFromLocation({
  href,
  referrer,
  now,
}: {
  href: string;
  referrer: string;
  now: Date;
}): LandingContext | null {
  const url = parseUrl(href);
  if (!url) return null;

  const params: LandingContext["params"] = {};
  for (const name of CAMPAIGN_PARAMS) {
    const value = cleanValue(url.searchParams.get(name) ?? undefined);
    if (value) params[name] = value;
  }

  const external = cleanValue(
    externalReferrer({ referrer, host: url.hostname })
  );

  return {
    landing: cleanValue(url.pathname) || "/",
    ...(external ? { referrer: external } : {}),
    landedAt: now.toISOString(),
    params,
  };
}

/** Whether a landing came from a tagged link or an ad click. */
export function hasCampaignParams(landing: LandingContext): boolean {
  return Object.keys(landing.params).length > 0;
}

/**
 * What to store after `incoming`, given what is `stored` — see the merge rule
 * at the top. Returns null when nothing should be written.
 */
export function mergeLanding({
  stored,
  incoming,
}: {
  stored: LandingContext | null;
  incoming: LandingContext;
}): LandingContext | null {
  if (hasCampaignParams(incoming)) return incoming;
  if (stored) return null;

  return incoming;
}

/**
 * The cookie value for a landing: JSON whose URI-encoded form fits
 * MAX_COOKIE_VALUE_LENGTH. Values are cut to shorter caps until it does —
 * over the limit the browser would drop the write without a trace, leaving
 * the previous campaign credited.
 */
export function serializeLanding(landing: LandingContext): string {
  let serialized = JSON.stringify(landing);
  for (const cap of COOKIE_VALUE_CAPS) {
    serialized = JSON.stringify(capLanding({ landing, cap }));
    if (encodeURIComponent(serialized).length <= MAX_COOKIE_VALUE_LENGTH) {
      return serialized;
    }
  }
  return serialized;
}

/**
 * The stored landing from a raw cookie value, or null when it is missing or
 * malformed. Accepts the value URI-encoded or not: the browser writes it
 * encoded, and server cookie parsers may or may not decode it. Anything that
 * is not a string where a string belongs is dropped — the cookie is
 * client-written, so the server treats it as untrusted input.
 */
export function parseLanding(raw: string | undefined): LandingContext | null {
  if (!raw) return null;

  const value = parseJson(raw) ?? parseJson(safeDecode(raw));
  if (!isRecord(value)) return null;
  if (typeof value.landing !== "string") return null;
  if (typeof value.landedAt !== "string") return null;

  const params: LandingContext["params"] = {};
  if (isRecord(value.params)) {
    for (const name of CAMPAIGN_PARAMS) {
      const param = value.params[name];
      if (typeof param === "string" && param) params[name] = param;
    }
  }

  return {
    landing: value.landing,
    ...(typeof value.referrer === "string" && value.referrer
      ? { referrer: value.referrer }
      : {}),
    landedAt: value.landedAt,
    params,
  };
}

/**
 * The cart attributes for a stored landing: a fixed set of keys, each value
 * stripped of control characters, trimmed and capped. Empty values are left
 * out. Underscore-prefixed keys are hidden from the buyer at checkout but
 * shown on the order in Shopify admin and in the Admin API.
 */
export function cartAttributesFromLanding({
  landing,
}: {
  landing: LandingContext | null;
}): CartAttribute[] {
  if (!landing) return [];

  const pairs: [string, string | undefined][] = [
    ["_landing", landing.landing],
    ["_referrer", landing.referrer],
    ["_landed_at", landing.landedAt],
    ...CAMPAIGN_PARAMS.map((name): [string, string | undefined] => [
      `_${name}`,
      landing.params[name],
    ]),
  ];

  return pairs.flatMap(([key, value]) => {
    const clean = cleanValue(value);
    return clean ? [{ key, value: clean }] : [];
  });
}

/**
 * Control characters stripped, trimmed, and cut to `cap` code points —
 * `Array.from` iterates by code point, so an emoji is never split into a
 * lone surrogate that Shopify could reject.
 */
function cleanValue(
  value: string | undefined,
  cap: number = MAX_VALUE_LENGTH
): string {
  if (!value) return "";
  const stripped = value
    // oxlint-disable-next-line no-control-regex -- stripping control characters is the point
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  return Array.from(stripped).slice(0, cap).join("");
}

/** The landing with every value cut to `cap` code points. */
function capLanding({
  landing,
  cap,
}: {
  landing: LandingContext;
  cap: number;
}): LandingContext {
  const params: LandingContext["params"] = {};
  for (const name of CAMPAIGN_PARAMS) {
    const value = cleanValue(landing.params[name], cap);
    if (value) params[name] = value;
  }
  const referrer = cleanValue(landing.referrer, cap);

  return {
    landing: cleanValue(landing.landing, cap) || "/",
    ...(referrer ? { referrer } : {}),
    landedAt: landing.landedAt,
    params,
  };
}

/**
 * A referrer from another site, as origin + path (its query string can carry
 * search terms or tokens). The current host and INTERNAL_HOST_SUFFIXES — the
 * site, its checkout, Shopify's checkout hosts — are not a source and return
 * undefined, so a visitor coming back from checkout is not credited to it.
 */
function externalReferrer({
  referrer,
  host,
}: {
  referrer: string;
  host: string;
}): string | undefined {
  const url = parseUrl(referrer);
  if (!url) return undefined;
  if (isInternalHost({ hostname: url.hostname, currentHost: host })) {
    return undefined;
  }

  return url.origin + url.pathname;
}

function isInternalHost({
  hostname,
  currentHost,
}: {
  hostname: string;
  currentHost: string;
}): boolean {
  if (hostname === currentHost) return true;

  return INTERNAL_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`)
  );
}

function parseUrl(value: string): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
