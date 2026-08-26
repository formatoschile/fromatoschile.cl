import imageFragment from "./image";
import seoFragment from "./seo";

/**
 * Slim fragment for product listings (catalog cards, sitemap). The full
 * `product` fragment below pulls variants/images/descriptionHtml and should
 * only back the product detail page. Deliberately omits `featuredImage` —
 * listing cards render a static preview placeholder, not the real image.
 */
export const productCardFragment = /* GraphQL */ `
  fragment productCard on Product {
    id
    handle
    title
    productType
    tags
    updatedAt
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    # First collection only — used to key a product to its category page.
    collections(first: 1) {
      edges {
        node {
          handle
        }
      }
    }
    # Full first-variant details so listings can add to cart optimistically.
    variants(first: 1) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    previewPdf: metafield(namespace: "custom", key: "previewPdf") {
      reference {
        ... on GenericFile {
          url
          mimeType
        }
      }
    }
  }
`;

const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          sku
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    featuredImage {
      ...image
    }
    seo {
      ...seo
    }
    productType
    previewPdf: metafield(namespace: "custom", key: "previewPdf") {
      reference {
        ... on GenericFile {
          url
          mimeType
        }
      }
    }
    tags
    updatedAt
    collections(first: 1) {
      edges {
        node {
          handle
        }
      }
    }
  }
  ${imageFragment}
  ${seoFragment}
`;

export default productFragment;
