import { IMAGE_FRAGMENT } from "../fragments/product";

/**
 * Editorial content that lives in Shopify (plan.md §5.1, §52).
 *
 * §5.2 keeps brand copy in the repository and §5.3 recommends MDX for
 * the journal. Yego's store already holds the real thing: the founder's
 * own account of the family business on a Shopify page, the store's
 * shipping and cancellation policies, and one published article. Real
 * content that exists beats a pipeline with nothing in it, and the
 * mapper boundary keeps §5.3's migration path open.
 */

export const PAGE_BY_HANDLE_QUERY = /* GraphQL */ `
  query PageByHandle($handle: String!) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
      seo {
        title
        description
      }
    }
  }
`;

/**
 * Only the policies this store actually has. Shopify returns null for
 * the ones that were never written, and a null policy must render as
 * absent rather than as an empty page (§48).
 */
export const POLICIES_QUERY = /* GraphQL */ `
  query Policies {
    shop {
      shippingPolicy {
        id
        handle
        title
        body
      }
      refundPolicy {
        id
        handle
        title
        body
      }
      privacyPolicy {
        id
        handle
        title
        body
      }
      termsOfService {
        id
        handle
        title
        body
      }
      subscriptionPolicy {
        handle
        title
        body
      }
    }
  }
`;

export const ARTICLES_QUERY = /* GraphQL */ `
  query Articles($first: Int!) {
    articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        excerpt
        publishedAt
        image {
          ...ImageFragment
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const ARTICLE_BY_HANDLE_QUERY = /* GraphQL */ `
  query ArticleByHandle($handle: String!) {
    articles(first: 1, query: $handle) {
      nodes {
        id
        handle
        title
        excerpt
        contentHtml
        publishedAt
        image {
          ...ImageFragment
        }
        seo {
          title
          description
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
