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

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFragment on Product {
    id
    handle
    title
    availableForSale
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
  }
`;

export const PRODUCT_DETAIL_FRAGMENT = /* GraphQL */ `
  fragment ProductDetailFragment on Product {
    ...ProductCardFragment
    description
    descriptionHtml
    options {
      id
      name
      values
    }
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
  }
`;
