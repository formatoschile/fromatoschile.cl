# Tracking and sales plan

What we will build so Formatos Chile can see which campaigns sell documents,
what each sale cost, and where the people who did not buy gave up.

**This is the technical build plan.** It names files, events and settings for
whoever implements the work. The client-facing proposal is a separate document,
in Spanish, derived from section 9; commercial terms are not kept in this
repository.

Modelled on the RK Abogados plan (`../rkabogados.cl/docs/tracking-plan.md`),
which is live and reviewed. Where a decision there carries over unchanged, this
plan says so and points to it rather than re-arguing it. What is different
here is the business: RK is lead generation (forms, WhatsApp), Formatos is a
shop — the goal is a **paid order with revenue**, and the last steps of the
journey happen on Shopify's checkout, not on our site.

Prepared 25 November 2026. Status: **draft, under review.**

**All dates and times are Santiago time** (`America/Santiago`), the zone the
Analytics property and Shopify store use. Work done from Cyprus between
midnight and 06:00 belongs to the previous Santiago day — convert before
writing a date down.

## Contents

1. [Where things stand today](#1-where-things-stand-today)
2. [The split: what the site sends, what Shopify sends](#2-the-split-what-the-site-sends-what-shopify-sends)
3. [Phase 1: Accounts and Shopify apps](#phase-1-accounts-and-shopify-apps)
4. [Phase 2: Make the site report every step](#phase-2-make-the-site-report-every-step)
5. [Phase 3: Consent banner and Consent Mode](#phase-3-consent-banner-and-consent-mode)
6. [Phase 4: Checkout and purchase from Shopify](#phase-4-checkout-and-purchase-from-shopify)
7. [Phase 5: Analytics configuration and funnels](#phase-5-analytics-configuration-and-funnels)
8. [Phase 6: Looker Studio dashboard](#phase-6-looker-studio-dashboard)
9. [Phase 7: Watch, then review](#phase-7-watch-then-review)
10. [Phase 8: Read the reports automatically (recurring, optional)](#phase-8-read-the-reports-automatically-recurring-optional)
11. [What the client gets, and effort](#9-what-the-client-gets-and-effort)
12. [After this](#10-after-this)
13. [Glossary](#11-glossary)

---

## 1. Where things stand today

Checked 25 November 2026.

**On the site (www.formatoschile.cl, Next.js on Vercel, live since 25 November 2026):**

- Only **Vercel Web Analytics** and **Speed Insights** (`src/components/Analytics/Analytics.tsx`). Cookieless, no consent needed, and they stay outside the banner — same position as RK (their phase 3, step 9).
- **No Tag Manager, no GA4, no Meta Pixel, no consent banner.** Nothing records a product view, an add to cart, or which campaign a visitor came from.
- **The Content-Security-Policy blocks every tracking vendor.** `next.config.ts` allows scripts, connections, images and frames from `'self'` (plus `cdn.shopify.com` for images/connections) and `frame-src 'none'`. GTM, GA4 and the Meta Pixel would all be refused by the browser, silently. Phase 2 has to widen it, deliberately and per vendor.
- **Sentry** is loaded and already keeps cookies, headers and user data off (`sentry.*.config.ts`). Unaffected.

**On Shopify:**

- Headless store. Checkout runs on Shopify at **`checkout.formatoschile.cl`**, primary domain since 25 November 2026. Being a subdomain of the site's domain is what lets cookies set on `www` (`_ga`, `_fbp`, `_fbc`) be read on checkout — no cross-domain linker needed. This was a prerequisite and is done.
- The Shopify theme storefront is redirected to the real site and `noindex` (`layout/theme.liquid`, 25 November 2026), so it cannot pollute the data or the search index.
- Delivery is the **Digital Products** app: download block on the Thank you and Order status pages, Spanish email.
- **Apps installed:** Digital Products, Messaging, `formatos-thumbnails` (ours). **No Facebook & Instagram app, no Google & YouTube app. Customer events: nothing configured** (to confirm in phase 1).
- **Shopify Analytics sees orders but not the storefront.** On a headless store Shopify only knows what happens on its own pages, so its sessions, conversion rate and "online store" reports are empty or wrong unless the site sends Shopify's analytics events. See phase 2.
- **Taxes:** "prices include tax" is **off** and every product is taxable. Under review by the client (product audit, 25 November 2026). It matters here because purchase `value` is sent with or without IVA depending on the answer — decide before phase 4, and say in the docs which one it is.

**Accounts that do not exist yet or are unknown:** Tag Manager container, GA4 property, Meta Business / ad account / Pixel, Google Ads account, Search Console property (a `google-site-verification` TXT already exists in DNS, so a property may exist). Phase 1 finds out.

### How a visitor buys

| Step | Where | Today |
| --- | --- | --- |
| Lands (ad, search, social) | site | Vercel only |
| Browses the catalogue / a category | `/todos-los-documentos`, `/todos-los-documentos/[collection]` | Vercel only |
| Opens a product, reads the watermarked PDF preview | `/product/[handle]` (`PdfViewer`) | nothing |
| Adds to cart | `AddToCartButton` → `addItem` in `src/components/cart/actions.ts` | nothing |
| **or** "Compra" straight to checkout, skipping the cart | `BuyButton` → `buyNow` | nothing |
| Opens the cart, presses checkout | `CartModal` → `redirectToCheckout` | nothing |
| Checkout (contact, payment) | `checkout.formatoschile.cl` (Shopify) | Shopify orders only |
| Pays, sees the download block | Thank you page (Shopify) | Shopify orders only |
| Gets the download email | Digital Products app | — |

Two routes into checkout — through the cart and the direct "Compra" — so the
funnel has to treat both as the same step.

### Open decisions

Each is the client's call (Seba / Cami) and blocks the phase it sits in.

| Decision | Whose call | Where it lands |
| --- | --- | --- |
| Install the Facebook & Instagram app and connect the Meta Business account | Seba | Phase 1, 4 |
| Install the Google & YouTube app (or let us use a custom pixel instead) | Seba | Phase 1, 4 |
| Prices with or without IVA, and therefore what `value` means | The client (product audit) | Phase 4 |
| ~~Banner on or off at launch~~ | **Settled 25 November 2026: off at launch, behind a flag** — as RK. See phase 3 | Phase 3 |
| When to switch the banner on (Ley 21.719, now expected 15 October 2027) | Davide and the client, ahead of that date | Phase 3 |
| Banner copy, cookie policy and privacy policy wording | The client writes it; we supply the inventory | Phase 3 |
| Google Ads at all, or Meta only to start | The client | Phase 1, 6 |
| Whether the dashboard is wanted | The client, after reading the funnels for 2–3 weeks | Phase 6 |
| Monthly follow-up | The client | Phase 8 |

---

## 2. The split: what the site sends, what Shopify sends

The decision the rest of the plan hangs on, and what the client proposed on
their side (their message of 24 November 2026): **purchases are recorded by
Shopify on its checkout, everything before checkout by the site.** It is the
right split for a headless store, because none of our code runs on Shopify's
checkout pages — only Shopify's own apps and pixels do.

| Event | Meta name | GA4 name | Sent by | How |
| --- | --- | --- | --- | --- |
| Page view | `PageView` | `page_view` | **Site** | GTM, on every navigation |
| Product viewed | `ViewContent` | `view_item` | **Site** | GTM, product page |
| List viewed | — | `view_item_list` | **Site** | GTM, catalogue and category pages |
| Product clicked in a list | — | `select_item` | **Site** | GTM |
| Preview opened / read | — | `fc_preview_*` (custom) | **Site** | GTM — see phase 2 |
| Added to cart | `AddToCart` | `add_to_cart` | **Site** | GTM, `addItem` succeeded |
| Checkout started | `InitiateCheckout` | `begin_checkout` | **Shopify** | F&I app / Google app or custom pixel |
| Payment info | `AddPaymentInfo` | `add_payment_info` | **Shopify** | same |
| Purchase | `Purchase` | `purchase` | **Shopify** | same, **with Conversions API** on the Meta side |

**InitiateCheckout is Shopify's, not ours** — changed from the client's
proposal, which had the site sending it. The F&I app already fires it when the
checkout loads. If the site also fired it on the "Pagar"/"Compra" click, the two
copies would carry different `event_id`s, Meta could not deduplicate them, and
every checkout would count twice. Shopify's is also the more truthful one: it
fires when checkout actually opened, not when a button was pressed. The site
still records the click as its own custom event (`fc_checkout_click`, GA4 only)
for the funnel, which never reaches Meta.

**One Pixel ID and one GA4 measurement ID on both sides.** The site's tags and
Shopify's apps must point at the same ones, or the journey splits into two
users at the checkout boundary.

**Deduplication.** With the split above no event is sent from both sides, so
there is nothing to deduplicate across them. Inside Shopify, the F&I app sends
each checkout event from the browser pixel *and* the Conversions API with the
same `event_id`, and Meta merges them — handled by the app, nothing to build.
If we later add a server-side Conversions API on the site (section 10), *that*
is when site events need an `event_id` shared between browser and server.

---

## Phase 1: Accounts and Shopify apps

| | |
| --- | --- |
| **Where** | Google and Meta interfaces, Shopify admin. No code. |
| **Effort** | Half a day |
| **Result** | Every account exists, is owned by the client, and is linked to the others. |

Same principle as RK: accounts are created under the **client's** Google and
Meta identities (contacto@formatoschile.cl or whoever owns the business), with
us added as users — never owned by us, so the client keeps everything if we
leave.

1. **Inventory first.** Does a GA4 property, GTM container, Google Ads account, Meta Business portfolio, ad account or Pixel already exist? Ask before creating — a second Pixel or property is hard to unwind. Check Search Console for an existing `formatoschile.cl` property (the TXT record suggests one).
2. **Tag Manager:** one web container for `www.formatoschile.cl`.
3. **GA4:** one property, one web stream for `www.formatoschile.cl`.

   | Setting | Value |
   | --- | --- |
   | Time zone / currency | Santiago / **CLP** |
   | Data retention | 14 months |
   | Google signals | On, reporting identity Blended |
   | Unwanted referrals | `checkout.formatoschile.cl` is the same root domain and needs nothing; add payment providers if they show up as referrers after the first test order (e.g. `webpay`, `mercadopago`, `transbank`, `paypal`) |
   | Enhanced measurement | Page views on browser history change **on** (client-side navigation); form interactions **off**; scroll **off** (we send our own); site search on if `/todos-los-documentos?q=` is used |
   | Cross-domain | **Off** — not needed, the checkout is a subdomain |

4. **Meta:** Business portfolio, ad account, one Pixel (dataset). Verify the domain `formatoschile.cl` in Business settings (DNS TXT or meta tag) — needed for Aggregated Event Measurement and for ads to optimise on Purchase.
5. **Search Console:** domain property `formatoschile.cl` (DNS verification), sitemap `https://www.formatoschile.cl/sitemap.xml`, linked to GA4. (Also on the client's separate list.)
6. **Google Ads**, if the client runs Google campaigns: link to GA4, auto-tagging on.
7. **Shopify apps** — only once Seba approves (open decision):
   - **Facebook & Instagram** by Meta: connect the Business portfolio and the **same Pixel**, data sharing **Maximum** (browser + Conversions API). Check that it is set to track the checkout on a headless store; if it insists on the Online Store channel, record what it does and does not fire before relying on it.
   - **Google & YouTube**: connect the **same GA4 property** and Google Ads. Phase 4 decides whether it stays or is replaced by a custom pixel.
8. **Shopify → Settings → Customer privacy:** record what is set (regions, banner, "data sale" opt-out). The checkout honours these; phase 3 has to agree with them.

### Checklist

- [ ] Inventory of existing Google / Meta accounts, asked of the client
- [ ] GTM container created, IDs recorded here
- [ ] GA4 property and stream, settings as above
- [ ] Meta Business, ad account, Pixel; domain verified
- [ ] Search Console property and sitemap; linked to GA4
- [ ] Google Ads linked (if used)
- [ ] F&I app installed and on the same Pixel (after approval)
- [ ] Google & YouTube app installed and on the same property (after approval)
- [ ] Shopify customer privacy settings recorded

---

## Phase 2: Make the site report every step

| | |
| --- | --- |
| **Where** | The website code. One pull request. |
| **Effort** | Two days including testing |
| **Result** | Every step before checkout reaches GTM with the same product fields, in GA4's ecommerce format, and the browser is allowed to load the tags. |

### One place for every signal

A new `src/lib/analytics/` (client code, imported by components) with a single
`trackEvent` helper that pushes to `window.dataLayer`. Same rules as RK's
phase 2, which were learned the hard way:

- **Every push resets every label** — push all known keys, `undefined` when the event does not set them. GTM keeps a persistent model of the dataLayer; without the reset, a `item_id` from one event leaks into the next.
- **Ecommerce pushes clear `ecommerce` first** (`dataLayer.push({ ecommerce: null })`), Google's own requirement for GA4 ecommerce.
- **The site decides what an event means; GTM only forwards.** No click-on-CSS-selector triggers in the container.
- **Event names are constants**, so nobody invents a new inconsistent one later.
- **Product fields come from one mapper**, `toAnalyticsItem(product, variant)`, so every event describes a document the same way:

| GA4 item field | From |
| --- | --- |
| `item_id` | Shopify variant SKU if set, otherwise the numeric product ID (no product has a SKU today — product audit) |
| `item_name` | product title |
| `item_category` | `productType` (`laboral`, `civil`, `societario`) |
| `item_list_name` | the list it was shown in, when relevant |
| `price` | variant price, number, CLP |
| `quantity` | 1 unless the cart says otherwise |

The **same `item_id`** must be what Shopify's apps send on checkout and
purchase, or the GA4 item reports and Meta's catalogue matching split one
document into two. Confirm the ID format the F&I and Google apps use (usually
the variant or product numeric ID) in phase 4 and align the mapper to it —
decide once, write it here.

### Signals

**Standard ecommerce (go to GA4 and, where listed in section 2, to Meta):**

| Signal | Fires when | Where in the code |
| --- | --- | --- |
| `page_view` | Every navigation | Enhanced measurement (history change) — verify not doubled |
| `view_item_list` | Catalogue or category rendered with products | `src/app/todos-los-documentos/_components/CatalogResults.tsx`, `[collection]/_components/CategoryResults.tsx`, home `FeaturedTemplates` |
| `select_item` | A card is clicked | `DocumentCard`, `TemplateCard`, `RelatedProductCard` |
| `view_item` | Product page mounted | `src/app/product/[handle]/page.tsx` (client child) |
| `add_to_cart` | `addItem` **succeeded** — not on click, so a failed add does not count | `AddToCartButton` / `useCartMutation` |
| `remove_from_cart` | Item removed | `DeleteItemButton` |
| `view_cart` | Cart modal opened with items | `CartModal` |

**Formatos-specific (GA4 only, prefix `fc_`):**

| Signal | Meaning |
| --- | --- |
| `fc_preview_open` | The PDF preview became visible / started rendering. The preview is the product's shop window; this says whether people look at it. |
| `fc_preview_page` | Scrolled to page N of the preview (once per page). Shows whether reading the sample sells or replaces buying. |
| `fc_checkout_click` | "Pagar" in the cart or "Compra" on a card/product pressed, with `route: cart \| buy_now`. Funnel step only — **never sent to Meta** (section 2). |
| `fc_checkout_error` | `buyNow` / `redirectToCheckout` returned an error and the toast showed. Today silent. |
| `fc_search` | Catalogue search submitted, with the term and result count, if search exists in the UI. |
| `fc_contact_click` | `mailto:` on `/contacto`, with location. |

Labels on every `fc_` signal: `page_type` (`home`, `catalog`, `category`,
`product`, `faq`, `contact`, `legal`), `location` (`hero`, `card`,
`product_page`, `related`, `cart`, …).

### Attribution

Same as RK's phase 2, minus the Caso code (no WhatsApp leads here — the order
itself is the record):

- GA4 and Meta read `gclid` / `wbraid` / `gbraid` / `fbclid` and `utm_*` themselves once their tags load. Nothing to build for that.
- **Make sure the click IDs survive to checkout.** `_fbc` / `_fbp` / `_ga` / `_gcl_aw` are cookies on `.formatoschile.cl` — readable by the checkout subdomain. Verify in phase 4 that the F&I app's Purchase carries `fbc`/`fbp` (Events Manager shows the match parameters), rather than assuming it.
- **Pass the landing context to the order** as cart attributes (`_landing`, `_utm_source`, `_utm_campaign`, …, `_fbclid`, `_gclid`) on `cartCreate`. Underscore-prefixed attributes are hidden from the buyer but visible on the order in Shopify admin and in the Admin API. This is the formatos equivalent of RK's Sheet row: every order carries the campaign that brought it, independently of cookies and consent — and it is what the dashboard's "orders by campaign" reads (phase 6). Gate it on advertising consent like RK gates its own attribution cookies.

### Shopify's own analytics (optional, recommended)

Shopify's built-in reports (sessions, conversion rate, top products) are blind
to a headless storefront. Hydrogen-react's `sendShopifyAnalytics` (page view and
add to cart, with the `_shopify_y`/`_shopify_s` cookies) fixes that and makes
Shopify Analytics agree with what the client sees in the admin. Small, but it
sets cookies, so it is gated by consent and listed in the cookie inventory. Do
it if the client looks at Shopify's reports; skip if GA4 is where they will
read.

### CSP — the change that makes or breaks everything

Widen `CONTENT_SECURITY_POLICY` in `next.config.ts` **per vendor**, with a
comment per line, exactly as the existing entries are commented. Minimum for
GTM + GA4 + Google Ads + Meta:

| Directive | Add |
| --- | --- |
| `script-src` | `https://www.googletagmanager.com`, `https://connect.facebook.net` (+ `https://www.googleadservices.com`, `https://googleads.g.doubleclick.net` if Google Ads conversion tags load from the page) |
| `connect-src` | `https://*.google-analytics.com`, `https://*.analytics.google.com`, `https://www.googletagmanager.com`, `https://www.facebook.com`, `https://connect.facebook.net` (+ `https://*.g.doubleclick.net`, `https://www.google.com` for Ads) |
| `img-src` | `https://*.google-analytics.com`, `https://www.googletagmanager.com`, `https://www.facebook.com` (+ `https://*.g.doubleclick.net`, `https://www.google.com`, `https://www.google.cl` for Ads) |
| `frame-src` | `https://www.googletagmanager.com` (Tag Assistant preview), `https://td.doubleclick.net` (Ads) — today `'none'` |

Verify against the browser console after deploying to a preview: every CSP
violation is reported there, and a tag that is refused looks, in GTM, exactly
like a tag that fired. Do **not** loosen to `*` or `https:`.

### Small things along the way

- GTM container ID in `src/env.ts` as `NEXT_PUBLIC_GTM_ID`, set in **Production only** on Vercel, so previews and localhost never send data (RK learnt this from preview conversions reaching Google Ads). Plus a non-production exception in the container (phase 5) as a second fence.
- No `noscript` GTM iframe — nothing on this site works without JavaScript, and it fires before consent can exist (RK phase 3, step 8).
- `user_data` (email, phone) is **not** sent from the site: the site never collects them — Shopify's checkout does, and the apps hash them there.

### Testing

Preview deployment (with a temporary GTM ID) + Tag Assistant: walk catalogue →
product → preview → add to cart → cart → checkout click, and "Compra" from a
card. Every event arrives once, with the right `items`, and no label carries
over. A smoke test like RK's `test:tracking` (agent-browser walking the funnel
and asserting the `dataLayer` sequence) is worth adding — it is the only thing
that catches tracking quietly dying after an unrelated refactor.

### Checklist

- [ ] `src/lib/analytics/` with `trackEvent`, event constants, label reset, ecommerce clear
- [ ] `toAnalyticsItem` mapper; `item_id` format agreed with phase 4
- [ ] `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`
- [ ] `fc_preview_open`, `fc_preview_page`, `fc_checkout_click` (both routes), `fc_checkout_error`, `fc_contact_click` (`fc_search` if search exists)
- [ ] Attribution cart attributes on `cartCreate`, gated on consent
- [ ] `sendShopifyAnalytics` (if decided)
- [ ] CSP widened per vendor, commented; zero violations on a preview
- [ ] `NEXT_PUBLIC_GTM_ID` in `src/env.ts`, Production only
- [ ] Tested on a preview with Tag Assistant, desktop and phone
- [ ] Smoke test
- [ ] `docs/tracking-events.md`: every event, its fields and what it means

---

## Phase 3: Consent banner and Consent Mode

| | |
| --- | --- |
| **Where** | Website code, Tag Manager, Shopify customer privacy. |
| **Effort** | One and a half days (RK's implementation is reused, not rewritten) |
| **Result** | The visitor's choice controls what Google, Meta and Shopify store, on the site **and** on checkout. |

**Reuse RK's consent code.** `src/lib/utils/consent.ts`, the bootstrap snippet,
`src/components/CookieConsent/` and their tests in `rkabogados.cl` already
solve the hard parts: default set before hydration, three categories
(necessary / analytics / advertising) mapped to all seven Consent Mode storage
types, a recorded choice that always wins, re-prompt versioning, and the
`CONSENT_REQUIRED` switch that turns the banner off without removing anything
(RK section 12). Port them, adapt the copy and the cookie list, keep the tests.

The one thing RK did not have: **the checkout is a second site.** The consent
the visitor gives on `www` must reach `checkout.formatoschile.cl`, or Shopify's
pixels there follow Shopify's own default instead. Shopify's mechanism for this
is the **Customer Privacy API** for headless storefronts: on every choice, the
site calls `setTrackingConsent` with the storefront and checkout root domains,
which writes Shopify's consent cookie on `.formatoschile.cl` so checkout reads
the same answer. Verify the exact call and parameters against Shopify's current
headless docs at build time — do not build from memory.

Step-by-step, including Tag Manager and Shopify settings, is
**`docs/plans/consent-mode-runbook.md`**.

### Ley 21.719: banner off at launch, one flag away — decided 25 November 2026

**Decision: the same as RK (their section 12).** The full consent machinery is
built and verified, but `CONSENT_REQUIRED = false`: a visitor who has not
answered is sent `granted` as the default, the banner never mounts, and the
footer's "Configurar cookies" stays as the route to reject. A recorded choice
is honoured to the letter, flag or no flag. Switching the banner on later is one
constant and one deploy — that is the whole point of building it now.

**Why off, and why now is the time it is defensible.** Ley 21.719 was due in
force on 1 December 2026. Congress passed a postponement to **15 October
2027** on 17 November 2026 (boletín 18.623-07). **As of 18 November it had not
been published in the Diario Oficial**, so until it is, 1 December 2026 is still
the legal date. Check publication before 1 December and record it here. The
postponement changes the calendar only; the obligations — consent included —
are unchanged when it arrives.

What the decision costs and buys, so it is written down rather than
remembered:

| | Banner off (chosen) | Banner on |
| --- | --- | --- |
| What Meta and Google see | Everyone who has not declined from the footer — the new ad account learns on full data | Only visitors who accept advertising |
| Legal position | The same as most of the Chilean market; dated bet until the law is in force | Aligned with Ley 21.719 |
| Shopify checkout | Customer Privacy API called with **granted** for unanswered visitors, the stored choice otherwise | Same call, the visitor's choice |
| Cost of switching later | One constant, one deploy — but Meta and Google will see a step down in conversions the day it flips, and campaigns relearn. **Record that date as a reporting baseline.** | — |

**Switch it on before 15 October 2027** (or 1 December 2026 if the
postponement is not published) — plan the date with the client so the drop in
reported conversions is expected, not alarming.

### Checklist

- [x] Banner decision: **off at launch behind `CONSENT_REQUIRED`**, 25 November 2026
- [ ] Postponement of Ley 21.719 confirmed published in the Diario Oficial (law number and date recorded here) — before 1 December 2026
- [ ] Consent code ported from `rkabogados.cl` with `CONSENT_REQUIRED = false`, tests passing in both positions
- [ ] Banner-on path verified once on a preview (flip, check, flip back) so the switch is known to work before it is needed
- [ ] Date to switch the banner on agreed with the client, ahead of the law's entry into force
- [ ] Customer Privacy API wired: every choice also sets Shopify's tracking consent for checkout
- [ ] Container work per the runbook, published
- [ ] Cookie inventory (`docs/cookie-inventory.md`) — site + Shopify checkout cookies
- [ ] Cookie policy and privacy policy pages (Shopify pages, served by the `[page]` route) updated by the client from the inventory
- [ ] Go-live date recorded as the reporting baseline

---

## Phase 4: Checkout and purchase from Shopify

| | |
| --- | --- |
| **Where** | Shopify apps and Customer events. No site code. |
| **Effort** | One day, most of it a real test order and reading what arrived |
| **Result** | `begin_checkout`, `add_payment_info` and `purchase` with revenue reach GA4 and Meta, once each, attributed to the session that came from the site. |

### Meta — the F&I app

Does it all: InitiateCheckout, AddPaymentInfo, Purchase, browser + Conversions
API with deduplication, hashed email/phone from checkout. Nothing to build.
What to check after the first test order (Events Manager → the Pixel → Test
events, then Overview):

- Purchase arrives **once**, with "Browser" and "Server" both ticked and "Deduplicated".
- `value` and `currency: CLP` correct — with or without IVA as decided (open decision).
- `content_ids` match the `item_id` the site sends on ViewContent/AddToCart. If they do not, the site's mapper changes, not the app.
- Event match quality: `fbp`/`fbc` present on the purchase — proves the subdomain cookie sharing works.

### GA4 — app or custom pixel

Two ways; pick by what the test order shows.

1. **Google & YouTube app** — zero code, maintained by Google. Fine **if** its `purchase` lands in the **same session** as the site's events, i.e. it reads the `_ga` cookie from `.formatoschile.cl`. Check in GA4 → Explore: the purchase's session source is the ad/organic source of the visit, not `checkout.formatoschile.cl` or `(direct)`.
2. **Custom pixel** (Settings → Customer events → Add custom pixel) — a short script subscribing to `checkout_started`, `payment_info_submitted`, `checkout_completed`, sending GA4 events with our measurement ID and the `client_id` read from `_ga` via the pixel's `browser.cookie`. Full control over `item_id` and `value`. Choose this if the app breaks the session or sends IDs we cannot align.

Either way, **only one of them** — never both, or purchases double. If the app
is replaced by the custom pixel, disconnect its GA4 side.

Google Ads purchase conversion, if Ads is used: import the GA4 `purchase` key
event into Ads, or let the Google app create the Ads conversion — one, not both.

### Consent on checkout

Shopify's pixels (app and custom) only run when Shopify's consent allows. With
phase 3 done, that is the visitor's choice from the site. Verify both ways in
the test: accept on the site → events arrive; reject → Meta and GA4 receive
nothing from checkout. (Custom pixels declare their required consent in the
Customer events settings: marketing + analytics.)

### The test order

A real purchase of a cheap document from a phone, arriving from a URL with
`?utm_source=test&utm_medium=test&utm_campaign=tracking-qa`, consent accepted,
then refunded. Check in order:

1. GA4 DebugView / Realtime: `view_item` → `add_to_cart` → `fc_checkout_click` → `begin_checkout` → `add_payment_info` → `purchase`, **one user, one session**, source `test / test`.
2. Meta Test events / Overview: ViewContent → AddToCart → InitiateCheckout → Purchase, deduplicated.
3. Shopify order: the `_utm_*` cart attributes from phase 2 are on it.
4. Email: Spanish download email from contacto@formatoschile.cl, DMARC pass (also closes the email work from 25 November 2026).

### Checklist

- [ ] F&I app on the same Pixel; Purchase deduplicated, value and IDs correct
- [ ] GA4 route chosen (app or custom pixel), reason recorded here
- [ ] Purchase in the same session as the site's events
- [ ] `item_id` aligned across site, app and pixel
- [ ] Consent honoured on checkout, both ways
- [ ] Test order done and refunded; all four checks above recorded with the date
- [ ] Google Ads purchase conversion (if Ads), from one source only

---

## Phase 5: Analytics configuration and funnels

| | |
| --- | --- |
| **Where** | Tag Manager and Analytics. No code. |
| **Effort** | One day |
| **Result** | Every signal reaches GA4 with its labels; purchase is a key event; the funnels show where non-buyers leave. |

**Tag Manager** (RK phase 4 is the template):

- Google tag with the GA4 measurement ID (and Ads ID if used) — combined into one Google tag if both, as RK did on 9 October 2026 for performance.
- One GA4 event tag for the ecommerce events (trigger: custom event regex `^(view_item|view_item_list|select_item|add_to_cart|remove_from_cart|view_cart)$`, "send ecommerce data" from the dataLayer).
- One GA4 event tag forwarding `^fc_.*` with its labels as parameters.
- Meta Pixel: base code on all pages, plus `ViewContent` and `AddToCart` from the same dataLayer events (via a Custom HTML tag or the community Facebook Pixel template), `content_ids` from `items[].item_id`, `content_type: product`, `value`, `currency`. **Never** `InitiateCheckout` or `Purchase` from GTM (section 2). Consent: **requires additional consent** — the Meta tag is not Google-built (runbook step 2b).
- Non-production exception: custom event `.*`, `Page Hostname does not equal www.formatoschile.cl` — built as RK finally built it, not as RK first built it (their phase 1 explains why a Page View exception blocks nothing).

**Analytics:**

- Custom dimensions (event scope): `page_type`, `location`, `route`, `preview_page`, `error_reason`, `search_term` if used.
- Key event: `purchase` (Shopify's). Optionally `add_to_cart` as a secondary signal for remarketing, not as a conversion.
- Audiences: "viewed a product, no purchase" (30 days) and "added to cart, no purchase" (7 days), excluding purchasers permanently — the remarketing lists for Meta and Google.

**Funnels** (Explore, shared with the client, published in a Reports collection like RK's):

1. **Shop funnel:** session → `view_item` → `add_to_cart` *or* `fc_checkout_click` route `buy_now` → `begin_checkout` → `purchase`. Broken down by channel and device.
2. **Preview funnel:** `view_item` → `fc_preview_open` → `fc_preview_page` ≥ 2 → `add_to_cart`/buy → `purchase`. Answers whether the watermarked preview sells.
3. **Category / document report:** item views, add-to-carts and purchases per `item_category` and `item_name` — which documents sell and which only get read.

Same caveat as RK, said to the client before they see the numbers: visitors who
decline are absent, not estimated (the traffic is far below Google's modelling
threshold). Proportions between steps hold; totals are an undercount.

### Checklist

- [ ] Container: Google tag, ecommerce tag, `fc_` forwarder, Meta tags, non-production exception
- [ ] Consent settings per the runbook; container published, date recorded
- [ ] Custom dimensions registered
- [ ] `purchase` marked key event (after it has arrived once)
- [ ] Audiences built
- [ ] Three funnels/reports built, shared, published in the menu
- [ ] Verified in DebugView on production

---

## Phase 6: Looker Studio dashboard

| | |
| --- | --- |
| **Where** | Looker Studio, under the client's Google account. |
| **Effort** | One to one and a half days |
| **Result** | One page: what was spent per channel and campaign, what it sold, and what each sale cost. |

Build it after the client has read the funnels for two or three weeks, as RK
did — otherwise we guess at the layout. RK's phase 6 is the template, with its
lessons kept: one number per question, owner's credentials so viewers need no
access, a 0 default for every column, comparison with the previous 28 days.

**Where each number comes from:**

| Number | Source | Why |
| --- | --- | --- |
| Orders and revenue | **Shopify** | The till. Every order, regardless of cookies. |
| Orders and revenue by campaign | Shopify orders, from the `_utm_*` cart attributes (phase 2) | Attribution that survives consent and ad blockers |
| Sessions, funnel steps | GA4 | Shopify cannot see the storefront |
| Google Ads spend, clicks | Google Ads connector | Native and free |
| Meta spend | **Google Sheet** | Looker has no free Meta connector — RK's solution, updated in the monthly review |

**Getting Shopify into Looker.** There is no free native connector. Two options:

- **A daily export to a Google Sheet** (one row per order: date, order number, total with/without IVA, `_utm_*` attributes, product types). Built as a Vercel cron in this repo calling the Admin API — the `formatos-thumbnails` app already has Admin API access, it needs the `read_orders` scope added — and writing via a Sheets service account. About half a day. Recommended: no subscription, and the data is the client's own.
- A paid connector (Supermetrics, Windsor, Porter…). Faster to set up, a monthly fee the client pays forever.

**Page layout (first draft, to be redone after the client's two weeks):**
scorecards (spend, orders, revenue, cost per order, ROAS), a table per
channel/campaign (spend, sessions, orders, revenue, cost per order), a weekly
chart (spend bars, revenue line), and the funnel from GA4. Never show orders
from both GA4 and Shopify on the same page — they disagree (consent,
attribution windows), and the first question will be which is right. Shopify
is the order count; GA4 explains the steps before it.

### Checklist

- [ ] Client agreed to the dashboard
- [ ] Shopify → Sheet export running daily (or connector chosen)
- [ ] Meta spend Sheet
- [ ] Report under the client's account, sources with owner's credentials
- [ ] Figures checked against Shopify admin and the ad interfaces for one full month
- [ ] Shared with the client

---

## Phase 7: Watch, then review

Half a day, about four weeks after phase 5 is live, counted from the consent
go-live. Same shape as RK's phase 7: the step with the largest loss, the
channel with the worst cost per order, the documents that get previewed but not
bought, the device where checkout is abandoned — each with one suggested
change. Ends with a recorded walkthrough in Spanish (~10 minutes) of where the
reports are and how to read them, sent as a link.

Final sweep before the call: phone walk of the whole funnel; the
non-production exception verified on a preview URL; `docs/tracking-events.md`
re-read against the code; audiences listed in Meta and Google Ads.

---

## Phase 8: Read the reports automatically (recurring, optional)

RK's phase 8, unchanged in shape: GA4 (`analytics-mcp`), Search Console and the
Shopify Admin API read-only through MCP, a skill in this repo with a fixed
question set, a monthly draft reviewed by a human before it reaches the client.
Shopify replaces RK's Caso Sheet as the source of truth for outcomes. Not part
of the core scope; offered after the client has read the first review.

---

## 9. What the client gets, and effort

Source for the Spanish proposal, not the proposal itself.

### The offer, in substance

> **Knowing which campaigns sell documents, and where you lose the rest**
>
> 1. **Connected accounts.** Analytics, Tag Manager, Meta, Search Console (and Google Ads if you use it), owned by you.
> 2. **Every step on the site recorded.** Which documents people look at, whether they read the preview, what they add to the cart, when they go to pay — labelled by page and position.
> 3. **Purchases recorded by Shopify itself**, with revenue, sent to Meta (including the server-side Conversions API) and to Analytics, so campaigns can optimise for sales rather than clicks.
> 4. **Every order carries the campaign that brought it**, visible in Shopify, independently of cookies.
> 5. **Consent ready for Ley 21.719, on the site and on checkout.** Built and tested now, kept switched off at launch like most of the market; turning the banner on before the law takes effect is a one-line change, not a project.
> 6. **Funnel reports**: where people leave between product, cart, checkout and payment; which documents sell.
> 7. **Remarketing lists**: people who looked at or added a document and did not buy.
> 8. **A review after one month** and a recorded walkthrough in Spanish.
>
> **Optional:** the one-page dashboard (spend, orders, revenue, cost per sale per campaign); a monthly reading of the reports.
>
> **To be clear about:** visitors who decline cookies are not measured; while the banner is off that is only the few who decline from the footer, and when it is switched on the reported conversions will step down that day — a measurement change, not a sales change. Shopify's order count and Analytics' will never match exactly, and Shopify is the one that counts.

### Effort

| Phase | What | Days |
| --- | --- | ---: |
| 1 | Accounts, apps | 0.5 |
| 2 | Site events, attribution, CSP, testing | 2 |
| 3 | Consent (ported from RK) incl. checkout | 1.5 |
| 4 | Shopify checkout/purchase, test order | 1 |
| 5 | GTM, GA4, Meta tags, funnels | 1 |
| 7 | Review and walkthrough | 0.5 |
| | **Core** | **6.5** |
| 6 | Dashboard incl. Shopify → Sheet export | 1 – 1.5 |
| | **With dashboard** | **7.5 – 8** |

---

## 10. After this

- **Server-side Conversions API from the site** for ViewContent/AddToCart (Vercel function, shared `event_id` with the browser). Improves Meta's match rate for the top of the funnel once spend justifies it.
- **Product catalogue to Meta** (the F&I app syncs it) for dynamic product ads to people who viewed a document.
- **Search Console × GA4 in Looker** — which searches bring buyers, per landing page (RK's custom tables, same method).
- **Use the drop-off data**: preview length, price points per category, the "Compra" button vs. the cart, measured as A/B tests.
- **Keep the data clean**: our own and the client's visits, test orders (tag them, refund them), bot spikes.

---

## 11. Glossary

RK's glossary (`../rkabogados.cl/docs/tracking-plan.md`, section 11) applies.
Additions for a shop:

**Ecommerce events.** GA4's fixed vocabulary for a shop — `view_item`, `add_to_cart`, `begin_checkout`, `purchase` — each carrying an `items` list. Using Google's names is what unlocks the built-in monetisation reports.

**Conversions API (CAPI).** Meta's server-to-server channel. The same event sent from the browser and from the server, with one `event_id`, so Meta keeps one and loses fewer to ad blockers and iOS.

**Deduplication.** Meta merging the browser and server copies of the same event using `event_id`. Only works if both copies carry the same ID.

**Customer events / web pixels.** Shopify's way of running tracking code on its checkout pages, in a sandbox, subject to the visitor's consent.

**Customer Privacy API.** Shopify's API for reading and setting the visitor's tracking consent; on a headless store, how the site's banner choice reaches the checkout.

**ROAS.** Return on ad spend: revenue divided by what the ads cost.
