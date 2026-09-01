import {
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
  PRODUCT_DETAIL_FRAGMENT,
  PRODUCT_VARIANT_FRAGMENT,
} from "../fragments/product";

/** Named operations (plan.md §52). */

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductCardFragment
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

/**
 * Cheapest possible authenticated read. Used to verify credentials
 * and reachability without depending on catalog state.
 */
export const SHOP_QUERY = /* GraphQL */ `
  query Shop {
    shop {
      name
      primaryDomain {
        url
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductDetailFragment
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;
