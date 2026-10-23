// Fields needed to decide whether a product's preview thumbnail is current.
// `thumbnailSource` is an app-owned metafield (`$app` namespace — hidden from
// the Shopify admin); see `previewThumbnails.ts` for its contents.
//
// Keep page sizes small: Shopify rejects queries whose requested cost
// (products × media) exceeds 1000 points.
const thumbnailProductFields = /* GraphQL */ `
  fragment thumbnailProduct on Product {
    id
    handle
    previewPdf: metafield(namespace: "custom", key: "previewPdf") {
      reference {
        ... on GenericFile {
          url
        }
      }
    }
    thumbnailSource: metafield(
      namespace: "$app"
      key: "preview_thumbnail_source"
    ) {
      value
      updatedAt
    }
    media(first: 10) {
      nodes {
        id
        alt
        status
      }
    }
  }
`;

export const getThumbnailProductQuery = /* GraphQL */ `
  query getThumbnailProduct($id: ID!) {
    product(id: $id) {
      ...thumbnailProduct
    }
  }
  ${thumbnailProductFields}
`;

export const getThumbnailProductsQuery = /* GraphQL */ `
  query getThumbnailProducts($after: String) {
    products(first: 25, after: $after) {
      nodes {
        ...thumbnailProduct
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${thumbnailProductFields}
`;
