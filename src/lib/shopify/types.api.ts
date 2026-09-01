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

export type ApiSelectedOption = {
  name: string;
  value: string;
};

export type ApiVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ApiMoneyV2;
  compareAtPrice: ApiMoneyV2 | null;
  selectedOptions: ApiSelectedOption[];
  image: ApiImage | null;
};

export type ApiProductDetail = ApiProduct & {
  description: string;
  descriptionHtml: string;
  options: Array<{ id: string; name: string; values: string[] }>;
  images: { edges: Array<{ node: ApiImage }> };
  variants: { edges: Array<{ node: ApiVariant }> };
  seo: { title: string | null; description: string | null } | null;
};

export type ApiProductByHandleQuery = {
  product: ApiProductDetail | null;
};

export type ApiCartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ApiMoneyV2;
    amountPerQuantity: ApiMoneyV2;
  };
  sellingPlanAllocation: {
    sellingPlan: { name: string } | null;
  } | null;
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    image: ApiImage | null;
    product: {
      title: string;
      handle: string;
    };
  };
};

export type ApiCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ApiMoneyV2;
    totalAmount: ApiMoneyV2;
  };
  lines: { edges: Array<{ node: ApiCartLine }> };
};

export type ApiCartQuery = { cart: ApiCart | null };

/** Shopify returns userErrors alongside the mutated cart. */
export type ApiCartMutationPayload = {
  cart: ApiCart | null;
  userErrors: Array<{ field: string[] | null; message: string }>;
};

export type ApiCartCreate = { cartCreate: ApiCartMutationPayload };
export type ApiCartLinesAdd = { cartLinesAdd: ApiCartMutationPayload };
export type ApiCartLinesUpdate = { cartLinesUpdate: ApiCartMutationPayload };
export type ApiCartLinesRemove = { cartLinesRemove: ApiCartMutationPayload };
