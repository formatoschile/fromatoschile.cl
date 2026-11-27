# GA4 reports — funnels and audiences

The funnels and remarketing audiences built in Analytics for
www.formatoschile.cl, defined precisely enough to rebuild or re-check them.
Analytics keeps explorations and audiences only in its own UI: no API exposes
an exploration's steps, so **this file is the record**. If one is changed in
Analytics, change it here in the same breath.

Property `566010437` (account `417563539`), measurement ID `G-JTP6VGESGM`.
The events and their labels are in [`tracking-events.md`](./tracking-events.md);
the reasoning is in [`plans/tracking-plan.md`](./plans/tracking-plan.md)
(phase 5, Funnels).

Built 27 November 2026, the day checkout events started arriving. Data before
that date has no `begin_checkout` / `purchase`, and the custom dimensions only
exist from that date, so **read nothing before 28 November 2026**.

## Funnels (Explore)

Both: funnel exploration, **closed** (not open), every step **"is indirectly
followed by"**, no time limit, no segments, no filters, breakdown **Device
category** (switch to *Session default channel group* for the channel view),
date range "Last 28 days". Counts are **users**. Shared read-only with every
user of the property (Explore → ⋮ → Share).

### `FC · Embudo tienda` — does the shop sell?

| # | Step name | Condition |
| --- | --- | --- |
| 1 | Visita | `session_start` |
| 2 | Vio un documento | `view_item` |
| 3 | Agregó al carrito o compró directo | `add_to_cart` **or** `fc_checkout_click` |
| 4 | Inició el pago | `begin_checkout` |
| 5 | Compró | `purchase` |

Step 3 has no `route` filter, on purpose: `fc_checkout_click` with
`route = cart` only happens from the cart, which needs an `add_to_cart` first,
so the unfiltered Or lets through exactly "added to cart, or pressed Compra".
(The funnel editor also could not filter on `route` on the build day: event
parameters appear in its picker only once processed data has them.)

Steps 4–5 come from Shopify's checkout (custom pixel, not the site), in the
same session as steps 1–3 — verified live on 27 November 2026 (same `cid` and
`sid`, see `plans/tracking-plan.md`, phase 4).

### `FC · Embudo vista previa` — does the watermarked preview sell?

| # | Step name | Condition |
| --- | --- | --- |
| 1 | Vio un documento | `view_item` |
| 2 | Abrió la vista previa | `fc_preview_open` |
| 3 | Hojeó la vista previa (pág. 2+) | `fc_preview_page` |
| 4 | Agregó al carrito o compró directo | `add_to_cart` **or** `fc_checkout_click` |
| 5 | Inició el pago | `begin_checkout` |
| 6 | Compró | `purchase` |

Step 3 needs no `preview_page ≥ 2` condition: `fc_preview_page` is only ever
sent for page 2 and later. Built as a duplicate of the shop funnel.

The question it answers is the drop from 2 to 3 and from 3 to 4 compared with
the shop funnel's 2 → 3: if people who page through the preview buy more often
than product viewers in general, the preview is selling.

### Which documents sell — no exploration

Built-in report, not an exploration: **Reports → Monetisation → Ecommerce
purchases**, table by **Item name** (or **Item category**): items viewed,
added to cart, purchased, item revenue. That is the plan's "category /
document report" (views vs add-to-carts vs purchases per document).

### Re-checking the numbers by API

Not possible yet: the analytics MCP's account has no access to this property
(403 on 27 November 2026). Once it has, rebuild each funnel with
`run_funnel_report` from the tables above, like RK's
[`funnel-analysis.md`](../../rkabogados.cl/docs/funnel-analysis.md) recipe —
`and_group` of `funnel_field_filter`s per step, an `or_group` for the Or
steps, `deviceCategory` breakdown, read the `RESERVED_TOTAL` row.

### Caveat to say before anyone reads them

Visitors who refuse cookies are absent, not estimated (traffic is far below
Google's modelling threshold). While the banner is off (until 15 October 2027)
that is only the few who refuse from the footer. Proportions between steps
hold; totals are an undercount. Shopify's order count, not GA4's, is the
number of sales.

## Audiences (Admin → Audiences)

Remarketing lists for Google Ads (once billing is set up and Ads is linked to
the property) and the basis for Meta's equivalents. Both exclude purchasers
**permanently**: someone who bought should not be chased with ads for the
document they already have.

| Audience | Include | Exclude (permanently) | Membership | Built |
| --- | --- | --- | --- | --- |
| `FC · Vio documento sin compra · 30d` | `view_item` | `purchase` | 30 days | 27 Nov 2026 |
| `FC · Carrito sin compra · 7d` | `add_to_cart` | `purchase` | 7 days | 27 Nov 2026 |

- Analytics fills a new audience with the previous 30 days at most, and
  shows "< 10 users" until it has enough people; Google Ads needs 100 active
  users before it serves to a list.
- A saved audience's conditions cannot be edited in Analytics; to change one,
  duplicate it, change the copy, and archive the old one — and update this
  table.
- Analytics also created its default `All Users` and `Purchasers` audiences;
  they are not ours and not used.
