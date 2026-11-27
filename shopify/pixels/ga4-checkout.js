/*
 * Formatos Chile — GA4 checkout events (Shopify custom pixel)
 *
 * Pasted into Shopify admin → Settings → Customer events → "GA4 checkout".
 * This file is the source of truth: change it here, review, then paste.
 * Plan: docs/plans/tracking-plan.md, phase 4. Events: docs/tracking-events.md.
 *
 * Why a pixel: none of the site's code runs on checkout.formatoschile.cl, so
 * begin_checkout, add_payment_info and purchase must be sent from Shopify.
 * The site never sends them (tracking plan, section 2).
 *
 * Admin settings for this pixel:
 *   Permission: Required → Analytics only.
 *   Data sale: "Data collected does not qualify as data sale".
 *
 * How it stays one journey with the site:
 *   - client_id comes from the `_ga` cookie, which the site's GA4 tag wrote on
 *     .formatoschile.cl and checkout (a subdomain) can read;
 *   - session_id comes from the `_ga_<stream>` cookie, so checkout lands in the
 *     visitor's current session, not a new one. Both IDs are set on the
 *     `config` call, where gtag treats them as fields (`cid`, `sid`), not as
 *     event parameters (`ep.session_id`). Verify `sid=` in the collect request
 *     during the test order;
 *   - a cookie that cannot be read counts as missing: events still go out;
 *   - gtag here stores nothing (client_storage: none) — the sandbox is another
 *     origin and would otherwise mint its own, different client ID.
 *
 * The sandbox reports its own URL to gtag, so every event carries the real
 * top-frame page_location from the event context.
 *
 * Items use the same fields as the site (src/lib/analytics/items.ts):
 * item_id = numeric variant ID, item_name, item_category = product type,
 * price = variant price (IVA included), quantity.
 *
 * value = total paid, IVA included (prices include IVA since 27 Nov 2026).
 *
 * Each event is sent once: per checkout token for begin_checkout and
 * add_payment_info, per order ID (or the checkout token, when Shopify gives
 * no order ID) for purchase. The key is claimed before any await, so two
 * copies arriving together cannot both go out.
 *
 * The Google & YouTube app, if installed later for Merchant Center, must
 * have its GA4 measurement off, or every purchase counts twice.
 */

const MEASUREMENT_ID = "G-JTP6VGESGM";
const DEFAULT_CATEGORY = "General";
// GA4's stream cookie is `_ga_` + the measurement ID without the `G-`.
const SESSION_COOKIE = "_ga_" + MEASUREMENT_ID.replace(/^G-/, "");
const SENT_KEY_PREFIX = "fc_ga4_sent:";
const claimedKeys = new Set();

const script = document.createElement("script");
script.setAttribute(
  "src",
  "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID
);
script.setAttribute("async", "");
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}

gtag("consent", "default", consentStateFrom({ privacy: init.customerPrivacy }));
subscribeToConsentChanges();

const ready = configure();

analytics.subscribe("checkout_started", function (event) {
  send({
    event,
    name: "begin_checkout",
    onceKey: checkoutKey({ event, step: "begin" }),
  });
});

analytics.subscribe("payment_info_submitted", function (event) {
  send({
    event,
    name: "add_payment_info",
    onceKey: checkoutKey({ event, step: "payment" }),
  });
});

analytics.subscribe("checkout_completed", function (event) {
  const checkout = event.data.checkout;
  const order = checkout.order;
  const orderId = order && order.id ? numericId(order.id) : null;
  // Shopify documents an order ID on checkout_completed; if it is ever
  // missing, the checkout token still identifies this purchase.
  const purchaseId = orderId || checkout.token || null;
  send({
    event,
    name: "purchase",
    onceKey: purchaseId ? "purchase:" + purchaseId : null,
    extra: purchaseParams({ checkout, transactionId: purchaseId }),
  });
});

/**
 * Consent changes made on Shopify's pages (its banner, when enabled). The
 * custom-pixel docs show both `api.customerPrivacy` and a bare
 * `customerPrivacy`; use whichever exists, and never crash on load over it.
 */
function subscribeToConsentChanges() {
  const privacyApi =
    typeof api !== "undefined" && api && api.customerPrivacy
      ? api.customerPrivacy
      : typeof customerPrivacy !== "undefined"
        ? customerPrivacy
        : null;
  if (!privacyApi || typeof privacyApi.subscribe !== "function") return;

  privacyApi.subscribe("visitorConsentCollected", function (event) {
    // No state in the event: leave consent as it is, never deny by accident.
    if (!event || !event.customerPrivacy) return;
    gtag(
      "consent",
      "update",
      consentStateFrom({ privacy: event.customerPrivacy })
    );
  });
}

/** Reads the site's GA cookies, then configures gtag with them. */
async function configure() {
  const ga = await readCookie({ name: "_ga" });
  const gaSession = await readCookie({ name: SESSION_COOKIE });
  const config = {
    send_page_view: false,
    client_storage: "none",
  };
  const clientId = clientIdFrom({ cookie: ga });
  if (clientId) config.client_id = clientId;
  const sessionId = sessionIdFrom({ cookie: gaSession });
  if (sessionId) config.session_id = sessionId;

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, config);
}

async function send({ event, name, onceKey, extra }) {
  if (onceKey) {
    // Claim synchronously, before any await, so a second copy of the same
    // event arriving meanwhile is dropped.
    if (claimedKeys.has(onceKey)) return;
    claimedKeys.add(onceKey);
    if (await wasSent({ key: onceKey })) return;
    await markSent({ key: onceKey });
  }

  await ready;
  const checkout = event.data.checkout;
  const params = Object.assign(
    {
      send_to: MEASUREMENT_ID,
      currency: checkout.currencyCode || "CLP",
      value: amount({ money: checkout.totalPrice }),
      items: (checkout.lineItems || []).map(function (line) {
        return toItem({ line });
      }),
      page_location: event.context.document.location.href,
      page_referrer: event.context.document.referrer,
    },
    extra || {}
  );

  gtag("event", name, params);
}

function purchaseParams({ checkout, transactionId }) {
  return {
    transaction_id: transactionId || undefined,
    tax: amount({ money: checkout.totalTax }),
    coupon: discountCodes({ checkout }),
  };
}

function toItem({ line }) {
  const variant = line.variant || {};
  const product = variant.product || {};
  return {
    item_id: variant.id ? numericId(variant.id) : "",
    item_name: product.title || line.title || "",
    item_category: product.type || DEFAULT_CATEGORY,
    price: variant.price ? Number(variant.price.amount) : 0,
    quantity: line.quantity || 1,
  };
}

function discountCodes({ checkout }) {
  const codes = (checkout.discountApplications || [])
    .filter(function (d) {
      return d.type === "DISCOUNT_CODE" && d.title;
    })
    .map(function (d) {
      return d.title;
    });
  return codes.length ? codes.join(",") : undefined;
}

/** checkout_started fires on every entry to checkout: once per checkout. */
function checkoutKey({ event, step }) {
  const token = event.data.checkout.token;
  return token ? step + ":" + token : null;
}

/** A cookie that cannot be read is treated as missing. */
async function readCookie({ name }) {
  try {
    return (await browser.cookie.get(name)) || "";
  } catch {
    return "";
  }
}

async function wasSent({ key }) {
  try {
    return (await browser.localStorage.getItem(SENT_KEY_PREFIX + key)) === "1";
  } catch {
    return false;
  }
}

async function markSent({ key }) {
  try {
    await browser.localStorage.setItem(SENT_KEY_PREFIX + key, "1");
  } catch {
    // Best effort: a missed mark risks one duplicate, never a lost event.
  }
}

/** `gid://shopify/ProductVariant/123` → "123"; "123" stays "123". */
function numericId(id) {
  return String(id).split("/").pop();
}

function amount({ money }) {
  return money && money.amount != null ? Number(money.amount) : 0;
}

/** `GA1.1.123456789.1700000000` → "123456789.1700000000". */
function clientIdFrom({ cookie }) {
  const match = /^GA\d\.\d\.(\d+\.\d+)$/.exec(cookie || "");
  return match ? match[1] : null;
}

/**
 * The current session ID from the stream cookie, in either format:
 * `GS1.1.1700000000.3.1...` (older) or `GS2.1.s1700000000$o3$g1...` (newer).
 */
function sessionIdFrom({ cookie }) {
  if (!cookie) return null;
  const v2 = /^GS2\.\d\.s(\d+)/.exec(cookie);
  if (v2) return v2[1];
  const v1 = /^GS1\.\d\.(\d+)/.exec(cookie);
  return v1 ? v1[1] : null;
}

function consentStateFrom({ privacy }) {
  const p = privacy || {};
  const analytics = p.analyticsProcessingAllowed ? "granted" : "denied";
  const marketing = p.marketingAllowed ? "granted" : "denied";
  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  };
}
