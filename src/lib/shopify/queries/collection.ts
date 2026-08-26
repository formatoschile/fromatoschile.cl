import imageFragment from "../fragments/image";
import seoFragment from "../fragments/seo";

const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    handle
    title
    description
    image {
      ...image
    }
    seo {
      ...seo
    }
    updatedAt
  }
  ${imageFragment}
  ${seoFragment}
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...collection
    }
  }
  ${collectionFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections($after: String) {
    collections(first: 100, after: $after, sortKey: TITLE) {
      edges {
        node {
          ...collection
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${collectionFragment}
`;
