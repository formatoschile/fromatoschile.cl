/// <reference types="bun" />

import { describe, expect, test } from "bun:test";

import type { CartItem, ProductVariant } from "@/lib/shopify/types";

import {
  cartItemToAnalyticsItem,
  getNumericId,
  toAnalyticsItem,
  toEcommerce,
} from "./items";

function makeVariant(id: string, amount: string): ProductVariant {
  return {
    id: `gid://shopify/ProductVariant/${id}`,
    title: "Default Title",
    availableForSale: true,
    selectedOptions: [],
    price: { amount, currencyCode: "CLP" },
  };
}

const PRODUCT = {
  title: "Contrato de arriendo",
  productType: "civil",
  variants: [makeVariant("111", "12990.0"), makeVariant("222", "15990.0")],
};

describe("getNumericId", () => {
  test("strips the Shopify GID prefix", () => {
    expect(getNumericId("gid://shopify/ProductVariant/4567")).toBe("4567");
  });

  test("passes a plain id through", () => {
    expect(getNumericId("4567")).toBe("4567");
  });
});

describe("toAnalyticsItem", () => {
  test("uses the first variant by default", () => {
    expect(toAnalyticsItem({ product: PRODUCT })).toEqual({
      item_id: "111",
      item_name: "Contrato de arriendo",
      item_category: "civil",
      price: 12990,
      quantity: 1,
    });
  });

  test("uses the given variant, list and position", () => {
    expect(
      toAnalyticsItem({
        product: PRODUCT,
        variant: PRODUCT.variants[1],
        listName: "catalog",
        index: 3,
      })
    ).toMatchObject({
      item_id: "222",
      price: 15990,
      item_list_name: "catalog",
      index: 3,
    });
  });

  test("keeps index 0", () => {
    expect(toAnalyticsItem({ product: PRODUCT, index: 0 })).toHaveProperty(
      "index",
      0
    );
  });

  test("falls back to the default category without a productType", () => {
    expect(
      toAnalyticsItem({ product: { ...PRODUCT, productType: "" } })
    ).toHaveProperty("item_category", "General");
  });
});

describe("cartItemToAnalyticsItem", () => {
  const CART_ITEM: CartItem = {
    id: "gid://shopify/CartLine/1",
    quantity: 2,
    attributes: [],
    // Line cost after a discount — must not leak into the item price.
    cost: { totalAmount: { amount: "20000.0", currencyCode: "CLP" } },
    merchandise: {
      id: "gid://shopify/ProductVariant/111",
      title: "Default Title",
      price: { amount: "12990.0", currencyCode: "CLP" },
      selectedOptions: [],
      product: {
        id: "gid://shopify/Product/9",
        handle: "contrato-de-arriendo",
        title: "Contrato de arriendo",
        productType: "civil",
        featuredImage: null,
      },
    },
  };

  test("matches the product mapper's id and list price", () => {
    expect(cartItemToAnalyticsItem({ item: CART_ITEM })).toEqual({
      item_id: "111",
      item_name: "Contrato de arriendo",
      item_category: "civil",
      price: 12990,
      quantity: 2,
    });
  });

  test("can report a single unit of the line", () => {
    expect(
      cartItemToAnalyticsItem({ item: CART_ITEM, quantity: 1 })
    ).toHaveProperty("quantity", 1);
  });
});

describe("toEcommerce", () => {
  test("sums price × quantity and defaults to CLP", () => {
    const items = [
      toAnalyticsItem({ product: PRODUCT, quantity: 2 }),
      toAnalyticsItem({ product: PRODUCT, variant: PRODUCT.variants[1] }),
    ];

    expect(toEcommerce({ items })).toEqual({
      currency: "CLP",
      value: 12990 * 2 + 15990,
      items,
    });
  });
});
