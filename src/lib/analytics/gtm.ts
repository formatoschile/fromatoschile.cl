/**
 * Google Tag Manager's loader, as a string for the root layout to inline
 * right after the Consent Mode default (src/lib/consent/consent.ts).
 *
 * Order is the point: the consent default must be in the dataLayer before
 * GTM's own `gtm.js` start event, so the layout renders the consent snippet
 * first and this second, both as classic inline scripts in `<head>`.
 *
 * Only rendered when NEXT_PUBLIC_GTM_ID is set, which is in Vercel's
 * Production environment only — previews and localhost never load the
 * container (tracking plan, phase 2). The container also blocks any
 * hostname other than www.formatoschile.cl (phase 5), as a second fence.
 *
 * No `noscript` iframe: nothing on this site works without JavaScript, and
 * it would fire before consent could exist (RK, phase 3).
 */

/**
 * A GTM web container ID, e.g. GTM-WQN2XMW4. The one definition: src/env.ts
 * validates NEXT_PUBLIC_GTM_ID with it too, so the two checks cannot drift.
 */
export const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

/**
 * Google's standard loader, minus the `l` parameter (we use the default
 * `dataLayer`). Returns null for anything that is not a container ID — the
 * value is interpolated into a script, and the root layout calls this on
 * every page, so a bad ID must mean "no GTM", never a 500. (Env validation
 * normally rejects it at startup; SKIP_ENV_VALIDATION turns that off.)
 */
export function buildGtmSnippet({
  containerId,
}: {
  containerId: string;
}): string | null {
  if (!GTM_ID_PATTERN.test(containerId)) {
    return null;
  }

  return [
    "(function (w, d, i) {",
    "w.dataLayer = w.dataLayer || [];",
    "w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });",
    "var f = d.getElementsByTagName('script')[0], j = d.createElement('script');",
    "j.async = true;",
    "j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;",
    "f.parentNode.insertBefore(j, f);",
    `})(window, document, '${containerId}');`,
  ].join(" ");
}
