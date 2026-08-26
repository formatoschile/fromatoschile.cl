import productFragment, { productCardFragment } from "../fragments/product";

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

export const getProductsQuery = /* GraphQL */ `
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $after: String
    $first: Int = 100
  ) {
    products(
      sortKey: $sortKey
      reverse: $reverse
      query: $query
      first: $first
      after: $after
    ) {
      edges {
        node {
          ...productCard
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${productCardFragment}
`;
