export type Maybe<T> = T | null;

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Connection<T> = {
  edges: Array<Edge<T>>;
  pageInfo?: PageInfo;
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<ShopifyCart, "lines"> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image | null;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  attributes: CartLineAttribute[];
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Collection = ShopifyCollection & {
  path: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = Omit<ShopifyProduct, "variants" | "collections"> & {
  variants: ProductVariant[];
  collectionHandle: string | null;
};

/** Slim listing model backed by the `productCard` fragment. */
export type ProductCard = Omit<
  ShopifyProductCard,
  "variants" | "collections"
> & {
  variants: ProductVariant[];
  collectionHandle: string | null;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  sku?: string;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};

export type ShopifyCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  image?: Image;
  seo: SEO;
  updatedAt: string;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  seo: SEO;
  productType: string;
  previewPdf: ProductPreviewPdf;
  tags: string[];
  updatedAt: string;
  collections: Connection<{ handle: string }>;
};

export type ShopifyProductCard = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  updatedAt: string;
  priceRange: {
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  previewPdf: ProductPreviewPdf;
  collections: Connection<{ handle: string }>;
};

export type ProductPreviewPdf = {
  reference: {
    url: string;
    mimeType: string;
  } | null;
} | null;

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    cartId: string;
  };
};

export type ShopifyUserError = {
  field: string[] | null;
  message: string;
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart; userErrors: ShopifyUserError[] } };
  variables: {
    lineItems?: { merchandiseId: string; quantity: number }[];
  };
};

export type CartLineAttribute = {
  key: string;
  value: string;
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
      userErrors: ShopifyUserError[];
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
      attributes?: CartLineAttribute[];
    }[];
  };
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
      userErrors: ShopifyUserError[];
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
      userErrors: ShopifyUserError[];
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>;
  };
  variables: {
    after?: string;
  };
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProductCard>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
    after?: string;
    first?: number;
  };
};
