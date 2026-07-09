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
  getCollection,
  getCollectionProducts,
  getCollections,
} from "./collections";
export { getPage, getPages } from "./pages";
export {
  getProduct,
  getProductById,
  getProductRecommendations,
  getProducts,
} from "./products";
