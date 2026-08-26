import { cache } from "react";

import { getCollection as _getCollection, getCollections } from "./collections";
import { getPage as _getPage, getPages } from "./pages";
import {
  getProduct as _getProduct,
  getProductById,
  getProductRecommendations,
  getProducts,
  getProductsPage,
} from "./products";

/**
 * Shopify Storefront API layer. All Storefront access goes through this
 * module — components and actions import from `@/lib/shopify` only.
 */
export {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "./cart";
export {
  getCollections,
  getPages,
  getProductById,
  getProductRecommendations,
  getProducts,
  getProductsPage,
};

// `"use cache"` dedupes across requests over time, not within a single
// render — `generateMetadata`, `opengraph-image`, and the page body each
// call these with identical args, so wrap in React's `cache()` to collapse
// that to one Shopify fetch per request.
export const getProduct = cache(_getProduct);
export const getPage = cache(_getPage);
export const getCollection = cache(_getCollection);
