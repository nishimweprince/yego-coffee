/**
 * Raw Storefront API response shapes (plan.md §29).
 *
 * The only module that names Shopify's wire format. Everything above
 * the mapper layer consumes the view models in ./types instead, so a
 * schema change lands here and nowhere else.
 */

export type ApiMoneyV2 = {
  amount: string;
  currencyCode: string;
};

export type ApiImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ApiProduct = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: ApiImage | null;
  priceRange: {
    minVariantPrice: ApiMoneyV2;
    maxVariantPrice: ApiMoneyV2;
  };
  sellingPlanGroups?: {
    edges: Array<{ node: { appName: string | null } }>;
  };
};

export type ApiProductsQuery = {
  products: {
    edges: Array<{ node: ApiProduct }>;
  };
};

export type ApiShopQuery = {
  shop: {
    name: string;
    primaryDomain: { url: string };
  };
};
