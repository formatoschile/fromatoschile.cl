import { HIDDEN_PRODUCT_TAG } from "@/lib/utils/constants";

import type {
  Cart,
  Collection,
  Connection,
  Product,
  ShopifyCart,
  ShopifyCollection,
  ShopifyProduct,
} from "./types";

export const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

export const reshapeCart = (cart: ShopifyCart): Cart => {
  const totalTaxAmount = cart.cost?.totalTaxAmount ?? {
    amount: "0.0",
    currencyCode: cart.cost.totalAmount.currencyCode,
  };

  return {
    ...cart,
    cost: { ...cart.cost, totalTaxAmount },
    lines: removeEdgesAndNodes(cart.lines),
  };
};

export const reshapeCollection = (
  collection: ShopifyCollection
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/todos-los-documentos/${collection.handle}`,
  };
};

export const reshapeCollections = (
  collections: ShopifyCollection[]
): Collection[] =>
  collections
    .filter((collection) => Boolean(collection))
    .map((collection) => reshapeCollection(collection))
    .filter((collection) => collection !== undefined);

export const reshapeProduct = (
  product: ShopifyProduct,
  shouldFilterHiddenProducts: boolean = true
): Product | undefined => {
  if (
    !product ||
    (shouldFilterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { variants, collections, ...rest } = product;

  return {
    ...rest,
    variants: removeEdgesAndNodes(variants),
    collectionHandle: removeEdgesAndNodes(collections)[0]?.handle ?? null,
  };
};
