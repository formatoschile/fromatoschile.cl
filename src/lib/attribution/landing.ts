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
 * advertising cookies (src/lib/consent/googleCookies.ts).
 */

/** The browser cookie holding the stored landing (JSON). */
export const LANDING_COOKIE_NAME = "fc_landing";

/** 30 days: a typical consideration window, and the cart cookie's lifetime. */
export const LANDING_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Shopify caps attribute values; ours are short anyway. */
const MAX_VALUE_LENGTH = 255;

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
    const value = url.searchParams.get(name);
    if (value) params[name] = value;
  }

  const external = externalReferrer({ referrer, host: url.hostname });

  return {
    landing: url.pathname,
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

export function serializeLanding(landing: LandingContext): string {
  return JSON.stringify(landing);
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

function cleanValue(value: string | undefined): string {
  if (!value) return "";
  return (
    value
      // oxlint-disable-next-line no-control-regex -- stripping control characters is the point
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, MAX_VALUE_LENGTH)
  );
}

/**
 * A referrer from another site, as origin + path (its query string can carry
 * search terms or tokens). Same-site referrers — the site itself, the
 * checkout subdomain — are not a source and return undefined.
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

  const site = registrableDomain(host);
  const isSameSite =
    url.hostname === host ||
    url.hostname === site ||
    url.hostname.endsWith(`.${site}`);
  if (isSameSite) return undefined;

  return url.origin + url.pathname;
}

/** `www.formatoschile.cl` → `formatoschile.cl`; `localhost` stays. */
function registrableDomain(host: string): string {
  return host.split(".").slice(-2).join(".");
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
