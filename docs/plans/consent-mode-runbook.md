# Consent Mode runbook — site, Tag Manager and Shopify checkout

The settings side of phase 3 of `docs/plans/tracking-plan.md`. Written out
step by step rather than done ad hoc, because two of the steps are
counter-intuitive enough to break everything quietly — and on this site there
are **three** places that have to agree on the visitor's choice, not one:

1. **The site** (`www.formatoschile.cl`) — sets the Consent Mode default and updates, and calls Shopify's Customer Privacy API.
2. **Tag Manager** — Google tags adapt by themselves; the Meta Pixel has to be gated.
3. **Shopify checkout** (`checkout.formatoschile.cl`) — the F&I app, the Google app or custom pixel, all governed by Shopify's consent cookie.

Adapted from RK's runbook (`../rkabogados.cl/docs/consent-mode-runbook.md`),
which is live and verified. Status: **draft — nothing here is built yet.**
Dates in Santiago time.

**Order matters.** Do not publish the container with consent settings before
the site code that sends the default is live: tags would wait for a default
that never comes and every visitor would be silently denied. Code first, then
container, then Shopify, then the checks.

---

## 0. What the site code must already do

Ported from `rkabogados.cl` (`src/lib/utils/consent.ts`, the bootstrap snippet
in the root layout, `src/components/CookieConsent/`). Before touching GTM,
confirm on a preview build:

- `dataLayer[0]` is a `consent default`, pushed **before hydration** and before the GTM snippet, covering all seven types:

  | Type | Category | Default, banner on | Default, banner off |
  | --- | --- | --- | --- |
  | `analytics_storage` | Analytics | denied | granted |
  | `ad_storage`, `ad_user_data`, `ad_personalization` | Advertising | denied | granted |
  | `functionality_storage`, `security_storage` | Necessary | granted | granted |
  | `personalization_storage` | — | denied | denied |

  An undeclared type behaves as **granted** — declare all seven.
- `url_passthrough` and `ads_data_redaction` set from the page.
- A `consent update` on accept, reject and save, with no page reload.
- A stored choice always wins over the default, in both positions of `CONSENT_REQUIRED` (RK section 12 — the regression test that guards this comes with the port).
- **New for formatos:** every choice, and the default on first load, is also sent to Shopify (step 4).
- No `noscript` GTM iframe.
- CSP allows the vendors (tracking plan, phase 2). A refused script looks, from GTM, exactly like a fired one — check the browser console for violations.

## 1. Turn on the consent overview

GTM → Admin → Container settings → **Enable consent overview**. A shield
appears beside Tags; every tag reads "Not configured" until reviewed.

## 2. Google tags: "No additional consent required"

**The step to get right, unchanged from RK.** Google-built tags have *built-in*
consent checks: they fire, read the consent state, and send a cookieless ping
when denied. "Require additional consent" is a different setting that stops the
tag firing at all — set it on a Google tag and you lose the cookieless ping,
which is the thing Consent Mode exists for.

| Tag | Type | Built-in checks | Additional consent |
| --- | --- | --- | --- |
| Google tag (GA4 + Ads, combined) | Google Tag | `ad_storage`, `ad_personalization`, `ad_user_data`, `analytics_storage` | **None** |
| GA4 – ecommerce events | GA4 Event | `analytics_storage` | **None** |
| GA4 – `fc_*` forwarder | GA4 Event | `analytics_storage` | **None** |
| Conversion Linker (if Ads) | Conversion Linker | `ad_storage`, … | **None** |

Bulk editor → "No additional consent required" also clears the "Not
configured" warning.

## 2b. Every non-Google tag: additional consent is mandatory

**This is where formatos differs from RK: the Meta Pixel lives in this
container.** A third-party tag knows nothing about Consent Mode. It fires, sets
`_fbp`, and sends data regardless — and because every Google tag is configured
correctly, nothing looks wrong.

| Tag | Require additional consent |
| --- | --- |
| Meta Pixel – base code | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Meta Pixel – ViewContent, AddToCart | the same three |
| Anything else non-Google (Hotjar, Clarity, TikTok…) | per RK's table in its step 2b |

Two more things for the Meta tags:

- **Consent ordering.** The Pixel base code must not fire on the default and then again on the update. Trigger it on the consent-granted state (an "Additional consent" check does this: GTM holds the tag until consent is granted, then fires it once). Verify `fbq('init')` runs exactly once per page in the Network tab.
- **Session recording tools** would capture checkout-adjacent behaviour and anything typed on `/contacto`. Not planned; if ever proposed, it is the client's call before it is ours.

Every new vendor moves three things together (RK step 2b): the tag's consent
setting, a row in `docs/cookie-inventory.md`, and the cookie / privacy policy
pages.

## 3. Confirm triggers match the code

The ecommerce trigger regex and the `^fc_.*` forwarder against the event
constants in `src/lib/analytics/`. And confirm **no** tag in the container is
triggered by `begin_checkout`, `purchase` or anything named `InitiateCheckout` /
`Purchase` — those belong to Shopify (tracking plan, section 2).

## 4. Shopify: make checkout follow the site's choice

Checkout runs on `checkout.formatoschile.cl`, where none of our code runs.
Shopify's pixels there (F&I app, Google app or custom pixel) obey **Shopify's**
consent state, read from its own cookie (`_tracking_consent`). If the site never
sets it, checkout falls back to whatever Shopify's region default is — which
may track a visitor who just declined on the site, or block one who accepted.

1. **Site side (code):** on first load and on every choice, call the Customer Privacy API's `setTrackingConsent` for a headless storefront, passing the storefront root domain, the checkout root domain and the Storefront access token, mapping our categories:

   | Our category | Shopify consent |
   | --- | --- |
   | Analytics | `analytics` |
   | Advertising | `marketing` (and `sale_of_data` follows marketing) |
   | Necessary | always on — Shopify's "preferences" maps here |

   Both domains share `formatoschile.cl`, which is what lets the cookie written from `www` be read on `checkout`. **Check Shopify's current headless consent documentation before building** — the call's name and parameters have changed before; this runbook names the mechanism, not the signature.
2. **Shopify admin → Settings → Customer privacy:** make the checkout's own behaviour consistent with the site's — region set to cover Chile, and the checkout must not show a second banner that contradicts the one the visitor already answered. Record what was set and the date.
3. **Customer events:** for a custom pixel (if phase 4 chooses one), set its permission to require **Marketing** and **Analytics**. App pixels (F&I, Google) declare their own; read them on the Customer events page and record them here.

## 5. Preview against a production build

Tag Assistant, fresh incognito profile, **production build** (`next build && next start`, or a Vercel preview with a test GTM ID) — not `next dev`, which hides races.

- **Consent tab → on-page default** matches the table in step 0 for the current position of `CONSENT_REQUIRED`.
- The default is the **first** dataLayer event, above any page view.
- **Accept all** → a consent update granting the four mutable types; the Meta base tag fires **once**, after the update.
- **Reject all**, fresh profile → Google tags still **fire, restricted**; the outgoing request carries `gcs=G100` (ad, analytics both denied). Meta tags **do not fire at all**. If a Google tag shows as blocked with no request, someone set "additional consent" on it — step 2.
- **Partial** (analytics yes, advertising no) → `gcs=G101`; Meta does not fire.

## 6. Cookies, per choice

DevTools → Application → Cookies, after loading a product page and adding to
cart:

| Choice | Present | Absent |
| --- | --- | --- |
| Rejected | `cookie-consent`, Shopify's consent cookie with analytics/marketing false, `cartId` (functional) | `_ga`, `_ga_*`, `_gcl_*`, `_fbp`, `_fbc`, `_shopify_y`, `_shopify_s`, the site's `_utm` / attribution cookies |
| Accepted | all of the above plus `_ga`, `_ga_*`, `_fbp` (and `_fbc` on a `?fbclid=` landing, `_gcl_aw` on a `?gclid=` landing) | — |
| Banner off, never answered | as Accepted, and **no** `cookie-consent` (nothing was asked) | — |

`cartId` is set by the cart regardless — it is what makes the cart work, and it
belongs in the inventory as strictly necessary.

## 7. Checkout follows the site — the test that matters most

Same fresh profile each time, with Meta's Test events and GA4 DebugView open:

1. **Accept** on the site → add a document → checkout. On `checkout.formatoschile.cl`, Shopify's consent cookie reads analytics + marketing **true**; Events Manager shows **InitiateCheckout** from the app; GA4 shows `begin_checkout` in the same session.
2. **Reject** on the site → same path. Shopify's consent cookie reads **false**; **no** InitiateCheckout in Meta; GA4 receives nothing from the checkout pixel.
3. Optional, the full order: complete a purchase in case 1 and refund it — Purchase arrives once, deduplicated (tracking plan, phase 4).

If case 2 still shows events from checkout, the site is not setting Shopify's
consent (step 4.1) or Shopify's own region default is overriding it (step 4.2).
Fix before publishing — this is the failure a regulator would find first.

## 8. Publish

Container version note:

> Consent Mode v2 + Meta gated on advertising — live from <date, time Santiago>.
> Reporting baseline; see docs/plans/tracking-plan.md phase 3.

Record the same date and time in the tracking plan's phase 3 checklist. It is
the baseline every report from phase 7 counts from.

## Launch mode: banner off

**Decided 25 November 2026, as RK:** `CONSENT_REQUIRED = false` at launch
(tracking plan, phase 3, for the reasoning and the Ley 21.719 dates). Nothing in
the container or Shopify setup changes between the two modes — only the
readings in steps 0, 5 and 6 do, and the runbook gives both. While the banner is
off, run steps 5–7 with the **reject** cases through the footer's "Configurar
cookies", which is then the only way to decline, and run them once more with the
flag on in a preview, so the switch is proven before it is needed.

## Still to decide

- **The date to switch the banner on**, ahead of Ley 21.719 (15 October 2027 if the postponement is published, otherwise 1 December 2026).
- **Policy pages** — the client writes them from `docs/cookie-inventory.md`, which must list the site's cookies, GTM/GA4/Meta, and Shopify checkout's own.
