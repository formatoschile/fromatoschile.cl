/**
 * Every event name the site pushes to the dataLayer. Use these constants —
 * never a string literal — so a new event can't drift from the documented set
 * (`docs/tracking-events.md`).
 *
 * Standard names are GA4's ecommerce vocabulary; `fc_` names are ours and go
 * to GA4 only. Checkout, payment and purchase are NOT here: Shopify sends them
 * from its checkout (tracking plan, section 2).
 */
export const ANALYTICS_EVENTS = {
  viewItemList: "view_item_list",
  selectItem: "select_item",
  viewItem: "view_item",
  addToCart: "add_to_cart",
  removeFromCart: "remove_from_cart",
  viewCart: "view_cart",
  previewOpen: "fc_preview_open",
  previewPage: "fc_preview_page",
  checkoutClick: "fc_checkout_click",
  checkoutError: "fc_checkout_error",
  search: "fc_search",
  contactClick: "fc_contact_click",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Lists a product can be shown in — the `item_list_name` of its items. */
export const ITEM_LISTS = {
  catalog: "catalog",
  category: "category",
  featuredHome: "featured_home",
  related: "related",
} as const;

export type ItemListName = (typeof ITEM_LISTS)[keyof typeof ITEM_LISTS];

/** Where on the page an interaction happened — the `location` label. */
export const LOCATIONS = {
  card: "card",
  featuredCard: "featured_card",
  templateCard: "template_card",
  relatedCard: "related_card",
  productPage: "product_page",
  cart: "cart",
  contactPage: "contact_page",
} as const;

export type AnalyticsLocation = (typeof LOCATIONS)[keyof typeof LOCATIONS];

/** How the visitor headed to checkout — the `route` label. */
export const CHECKOUT_ROUTES = {
  cart: "cart",
  buyNow: "buy_now",
} as const;

export type CheckoutRoute =
  (typeof CHECKOUT_ROUTES)[keyof typeof CHECKOUT_ROUTES];
