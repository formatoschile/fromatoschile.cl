import type {
  CartItem,
  Product,
  ProductCard,
  ProductVariant,
} from "@/lib/shopify/types";
import { getProductCategory } from "@/lib/utils/product";

import type { ItemListName } from "./events";

/** One document in GA4's ecommerce `items` format. */
export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
  item_list_name?: ItemListName;
  index?: number;
}

export interface AnalyticsEcommerce {
  currency: string;
  value: number;
  items: AnalyticsItem[];
  item_list_name?: ItemListName;
}

const DEFAULT_CURRENCY = "CLP";

/**
 * The single mapper from a Shopify product to an analytics item, so every
 * event describes a document the same way.
 *
 * `item_id` is the numeric **variant** ID — what Shopify's checkout apps
 * report for the same line. If the phase 4 test order shows otherwise, change
 * it here and nowhere else.
 */
export function toAnalyticsItem({
  product,
  variant = product.variants[0],
  listName,
  index,
  quantity = 1,
}: {
  product: Pick<Product | ProductCard, "title" | "productType" | "variants">;
  variant?: ProductVariant;
  listName?: ItemListName;
  index?: number;
  quantity?: number;
}): AnalyticsItem {
  return {
    item_id: variant ? getNumericId(variant.id) : "",
    item_name: product.title,
    item_category: getProductCategory(product),
    price: variant ? Number(variant.price.amount) : 0,
    quantity,
    ...(listName ? { item_list_name: listName } : {}),
    ...(index === undefined ? {} : { index }),
  };
}

/**
 * Same mapping for a cart line, which carries less of the product. `price` is
 * the variant's list price, as in `toAnalyticsItem` — not the line cost,
 * which is after discounts and would make one document report two prices.
 */
export function cartItemToAnalyticsItem({
  item,
  quantity = item.quantity,
}: {
  item: CartItem;
  quantity?: number;
}): AnalyticsItem {
  return {
    item_id: getNumericId(item.merchandise.id),
    item_name: item.merchandise.product.title,
    item_category: getProductCategory(item.merchandise.product),
    price: Number(item.merchandise.price.amount),
    quantity,
  };
}

/** Wraps items in the ecommerce object, with `value` = Σ price × quantity. */
export function toEcommerce({
  items,
  currency = DEFAULT_CURRENCY,
  listName,
}: {
  items: AnalyticsItem[];
  currency?: string;
  listName?: ItemListName;
}): AnalyticsEcommerce {
  const value = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return {
    currency,
    value,
    items,
    ...(listName ? { item_list_name: listName } : {}),
  };
}

/** `gid://shopify/ProductVariant/123` → `123`; anything else passes through. */
export function getNumericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}
