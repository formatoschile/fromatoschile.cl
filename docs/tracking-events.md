# Tracking events

Every event the site pushes to `window.dataLayer`, its fields and what it
means. The plan behind it is `docs/plans/tracking-plan.md` (phase 2); this file
describes what the code actually does. **Change both together**: if an event is
added, renamed or changes meaning, update this file in the same commit.

Code: `src/lib/analytics/` (helper, constants, item mapper, GTM loader) and
`src/components/Analytics/` (React wrappers). Events are pushed whether or not
Tag Manager has loaded; GTM replays the queue when it does.

Tag Manager (`GTM-WQN2XMW4`) loads only where `NEXT_PUBLIC_GTM_ID` is set —
Vercel Production. Locally and on previews nothing leaves the browser. On
every page the dataLayer starts with the Consent Mode default
(`src/lib/consent/consent.ts`), then GTM's `gtm.js`, then the site's events.

## What the site does *not* send

`begin_checkout`, `add_payment_info` and `purchase` (Meta: `InitiateCheckout`,
`AddPaymentInfo`, `Purchase`) are sent by **Shopify** from its checkout, through
the Facebook & Instagram and Google & YouTube apps. The site never sends them;
if it did, every checkout would count twice (tracking plan, section 2).

## Fields on every push

| Field | Values | Notes |
| --- | --- | --- |
| `event` | see below | Constants in `ANALYTICS_EVENTS` |
| `page_type` | `home`, `catalog`, `category`, `product`, `faq`, `contact`, `legal`, `other` | From the URL path, `getPageType` |
| `page_location` | Full URL at the moment of the push | Sent by both GA4 event tags as `page_location`. Needed because on a client-side navigation GA4 learns of the new page only from its history-change `page_view`, which arrives *after* the new page's first events — without it, `view_item` etc. would be credited to the previous page. The order (events before that `page_view`) is expected and harmless |
| `location` | `card`, `featured_card`, `template_card`, `related_card`, `product_page`, `cart`, `contact_page` | Where the interaction happened |
| `route` | `cart`, `buy_now` | Checkout events only |
| `preview_page` | 2, 3, … | `fc_preview_page` only |
| `error_reason` | the error shown to the visitor | `fc_checkout_error` only |
| `search_term` | the trimmed search text | `fc_search` only |
| `search_results` | number, first page only (≤ page size) | `fc_search` only |

Every push sets **all** label fields, `undefined` where the event does not use
them, and non-ecommerce pushes set `ecommerce: null`, so nothing can leak from
one event into the next in GTM's data model.

## Ecommerce events (GA4; Meta where noted)

Each is preceded by a `{ ecommerce: null }` push. The `ecommerce` object is
`{ currency, value, items, item_list_name? }`, with `value` = Σ price × quantity.

Each item, built only by `toAnalyticsItem` / `cartItemToAnalyticsItem`:

| Field | From |
| --- | --- |
| `item_id` | Numeric Shopify **variant** ID (`gid://shopify/ProductVariant/123` → `123`). Must equal what Shopify's apps send on checkout and purchase — to confirm with the phase 4 test order |
| `item_name` | Product title |
| `item_category` | `productType` (`laboral`, `civil`, `societario`), `General` if empty |
| `price` | Variant list price, number, CLP, as Shopify returns it (IVA: open decision). Cart lines use the same variant price, not the line cost after discounts |
| `quantity` | 1, or the cart line's quantity |
| `item_list_name` | `catalog`, `category`, `featured_home`, `related` — list events only |
| `index` | Position in that list, from 0 |

| Event | Meta | Fires when | Where |
| --- | --- | --- | --- |
| `view_item_list` | — | A product list renders. Once per item: "load more" reports only the new items; a new search or filter reports the new list | `DocumentsCatalog`, `CategoryCatalog`, `FeaturedTemplates`, `RelatedProducts` |
| `select_item` | — | A product card's link is clicked, with `location` = the card kind | `ProductLink` in `DocumentCard`, `FeaturedCard`, `TemplateCard`, `RelatedProductCard` |
| `view_item` | `ViewContent` | Product page shown, with the first variant | `TrackViewItem` in `product/[handle]/page.tsx` |
| `add_to_cart` | `AddToCart` | Shopify **confirmed** the add (a failed add is not counted). Also the cart's "+" button, quantity 1, `location: cart` | `AddToCart`, `EditItemQuantityButton` |
| `remove_from_cart` | — | Shopify confirmed the removal: the cart's ✕ (whole line) or "−" (quantity 1) | `DeleteItemButton`, `EditItemQuantityButton` |
| `view_cart` | — | The cart panel opens with items in it. Once per opening; adding to cart opens it, so an add is usually followed by a `view_cart` | `useTrackViewCart` in `CartModal` |

## Formatos events (GA4 only, `fc_` prefix)

| Event | Fires when | Labels | Where |
| --- | --- | --- | --- |
| `fc_preview_open` | The preview PDF has loaded on a product page | — | `useTrackPreview` in `PdfViewer` |
| `fc_preview_page` | Page N (N ≥ 2) of the preview is shown for the first time on that page view | `preview_page` | same |
| `fc_checkout_click` | "Continuar con el pago" in the cart, or a "Compra" button | `route`, `location` | `CheckoutForm`, `BuyButton` |
| `fc_checkout_error` | "Compra" could not create the checkout and the error toast showed | `route: buy_now`, `location`, `error_reason` | `BuyButton` |
| `fc_search` | Results for a new search term rendered (catalog or category). Not repeated for the same term | `search_term`, `search_results` | `useTrackSearch` |
| `fc_contact_click` | The `mailto:` link on `/contacto` | `location: contact_page` | `ContactEmailLink` |

`fc_checkout_click` is **never** forwarded to Meta: Shopify sends the real
`InitiateCheckout` when checkout loads.

## Known gaps

- A failure of the cart's own checkout redirect (`redirectToCheckout` throwing) is not reported as `fc_checkout_error`; it goes to Sentry and the error page.
- `view_item_list` for the home rail and related products fires when they render, not when scrolled into view.
- Coming back to a page (Back button, or a link to a page visited moments ago) counts as a new view: `view_item`, `view_item_list` and the preview events fire again, as GA4's `page_view` does. In development, React Strict Mode makes these fire twice on first load; production builds do not.
- Page views are not pushed by the site: GA4's enhanced measurement records them on history changes (tracking plan, phase 1).

## Checking it

In the browser console on any page, `window.dataLayer` lists every push in
order. Unit tests: `bun run test`.
