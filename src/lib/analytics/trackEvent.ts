import type {
  AnalyticsEventName,
  AnalyticsLocation,
  CheckoutRoute,
} from "./events";
import type { AnalyticsEcommerce } from "./items";
import { getPageType } from "./pageType";

/** Labels an event may carry. Every push sends all of them (see below). */
export interface AnalyticsLabels {
  location?: AnalyticsLocation;
  route?: CheckoutRoute;
  preview_page?: number;
  error_reason?: string;
  search_term?: string;
  search_results?: number;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const LABEL_KEYS = [
  "location",
  "route",
  "preview_page",
  "error_reason",
  "search_term",
  "search_results",
] as const satisfies readonly (keyof AnalyticsLabels)[];

/**
 * The only way the site reports an event. Pushes to `window.dataLayer`; GTM
 * forwards it to GA4/Meta once it loads (pushes made before then are queued
 * and replayed). The site decides what an event means — GTM only forwards.
 *
 * Two rules from the RK build, both required:
 * - Every push resets every label to `undefined` unless this event sets it.
 *   GTM keeps a merged model of all pushes, so without the reset a `route`
 *   from one event leaks into the next.
 * - Ecommerce pushes are preceded by `{ ecommerce: null }` (Google's own
 *   requirement), so items from a previous event can't merge into this one;
 *   every other push sets `ecommerce: null`, so it can't inherit them either.
 *
 * Safe to call anywhere: a no-op on the server.
 */
export function trackEvent({
  event,
  labels = {},
  ecommerce,
}: {
  event: AnalyticsEventName;
  labels?: AnalyticsLabels;
  ecommerce?: AnalyticsEcommerce;
}): void {
  if (typeof window === "undefined") return;

  window.dataLayer ??= [];

  const resetLabels = Object.fromEntries(
    LABEL_KEYS.map((key) => [key, undefined])
  );

  if (ecommerce) {
    window.dataLayer.push({ ecommerce: null });
  }

  window.dataLayer.push({
    event,
    page_type: getPageType(window.location.pathname),
    ...resetLabels,
    ...labels,
    ecommerce: ecommerce ?? null,
  });
}
