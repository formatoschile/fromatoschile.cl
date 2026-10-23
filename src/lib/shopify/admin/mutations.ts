export const stagedUploadsCreateMutation = /* GraphQL */ `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const productAddMediaMutation = /* GraphQL */ `
  mutation productAddMedia($id: ID!, $media: [CreateMediaInput!]!) {
    productUpdate(product: { id: $id }, media: $media) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const productReorderMediaMutation = /* GraphQL */ `
  mutation productReorderMedia($id: ID!, $moves: [MoveInput!]!) {
    productReorderMedia(id: $id, moves: $moves) {
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

export const fileDeleteMutation = /* GraphQL */ `
  mutation fileDelete($fileIds: [ID!]!) {
    fileDelete(fileIds: $fileIds) {
      deletedFileIds
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const metafieldsSetMutation = /* GraphQL */ `
  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors {
        field
        message
      }
    }
  }
`;

export const metafieldsDeleteMutation = /* GraphQL */ `
  mutation metafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      userErrors {
        field
        message
      }
    }
  }
`;
