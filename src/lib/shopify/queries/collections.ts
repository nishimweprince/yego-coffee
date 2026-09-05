import {
  COLLECTION_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
} from "../fragments/product";

/** Named operations (plan.md §52). */

export const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      ...CollectionFragment
      products(first: $first) {
        edges {
          node {
            ...ProductCardFragment
          }
        }
      }
    }
  }
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          ...CollectionFragment
        }
      }
    }
  }
  ${COLLECTION_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;
