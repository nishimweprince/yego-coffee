import {
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
} from "../fragments/product";

/** Search operations (plan.md §14, §52). */

/**
 * Predictive search powers the panel (§14.1). It is deliberately narrow:
 * products and query suggestions only. Yego has no Shopify pages or
 * articles — the journal is repository-managed (§5.2) — so asking for
 * them would render permanently empty result groups.
 */
export const PREDICTIVE_SEARCH_QUERY = /* GraphQL */ `
  query PredictiveSearch($query: String!, $limit: Int!) {
    predictiveSearch(
      query: $query
      limit: $limit
      types: [PRODUCT, QUERY]
      limitScope: EACH
    ) {
      products {
        ...ProductCardFragment
      }
      queries {
        text
        styledText
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const SEARCH_QUERY = /* GraphQL */ `
  query Search($query: String!, $first: Int!, $after: String) {
    search(
      query: $query
      first: $first
      after: $after
      types: [PRODUCT]
      unavailableProducts: LAST
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on Product {
            ...ProductCardFragment
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;
