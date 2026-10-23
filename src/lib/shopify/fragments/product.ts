/** Product fragments (plan.md §21.2). */

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

/**
 * `sellingPlanGroups` here answers "does this product carry a plan at
 * all", which is NOT the same as "you can subscribe to this variant" —
 * §96.6. Gatare has a group that covers only its 5 lb variant. The
 * per-variant truth lives in `sellingPlanAllocations` on the variant,
 * which the detail fragment fetches; the card's flag is named for what
 * it actually knows.
 *
 * Tags are Yego's only structured product signal — there are no
 * metafields in this store (§96.4) — so roast comes from here, and
 * from `options`: the 5 lb Bag holds its three roasts as option values
 * rather than tags, and a listing that filtered on tags alone hid it
 * from `?roast=light` while it was on the shelf in light.
 */
export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFragment on Product {
    id
    handle
    title
    availableForSale
    tags
    productType
    options {
      id
      name
      values
    }
    featuredImage {
      ...ImageFragment
    }
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
    sellingPlanGroups(first: 1) {
      edges {
        node {
          appName
        }
      }
    }
  }
`;

/**
 * The allocation is the only per-variant subscription truth, and it
 * carries the price. Reading a plan's cadence from its `name` is what
 * §96.3 forbids — one plan in this store is called "Weekly membership"
 * and bills every 60 days — so the recurring delivery policy comes
 * along and is the only thing cadence copy is generated from.
 */
export const SELLING_PLAN_ALLOCATION_FRAGMENT = /* GraphQL */ `
  fragment SellingPlanAllocationFragment on SellingPlanAllocation {
    priceAdjustments {
      price {
        ...MoneyFragment
      }
      compareAtPrice {
        ...MoneyFragment
      }
    }
    sellingPlan {
      id
      name
      description
      recurringDeliveries
      deliveryPolicy {
        ... on SellingPlanRecurringDeliveryPolicy {
          interval
          intervalCount
        }
      }
    }
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = /* GraphQL */ `
  fragment ProductVariantFragment on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    price {
      ...MoneyFragment
    }
    compareAtPrice {
      ...MoneyFragment
    }
    selectedOptions {
      name
      value
    }
    image {
      ...ImageFragment
    }
    sellingPlanAllocations(first: 10) {
      nodes {
        ...SellingPlanAllocationFragment
      }
    }
  }
`;

/**
 * `requiresSellingPlan` marks the Roaster's Choice products, which can
 * only be bought on a schedule: the product page must not offer them
 * "one time" (§109).
 *
 * `bagsPerDelivery` is the one metafield this storefront reads
 * (`custom.bags_per_delivery`). It is how a plan's per-bag price is
 * worked out; the count is never parsed from a title (§109).
 *
 * `shareImage` is the featured image re-encoded by Shopify's CDN as a
 * JPEG. Several of the store's photographs were uploaded as HEIC, which
 * social crawlers do not render, so link previews use this instead.
 */
export const PRODUCT_DETAIL_FRAGMENT = /* GraphQL */ `
  fragment ProductDetailFragment on Product {
    ...ProductCardFragment
    description
    descriptionHtml
    images(first: 12) {
      edges {
        node {
          ...ImageFragment
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          ...ProductVariantFragment
        }
      }
    }
    seo {
      title
      description
    }
    requiresSellingPlan
    bagsPerDelivery: metafield(namespace: "custom", key: "bags_per_delivery") {
      value
    }
    shareImage: featuredImage {
      url(transform: { preferredContentType: JPG, maxWidth: 1200 })
    }
  }
`;

export const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionFragment on Collection {
    id
    handle
    title
    description
    image {
      ...ImageFragment
    }
  }
`;
