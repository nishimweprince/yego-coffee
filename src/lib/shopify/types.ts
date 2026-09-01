/**
 * Normalized Shopify types (plan.md §29).
 *
 * These are the shapes the UI consumes. Raw Storefront API responses
 * are mapped into them at the data layer so schema churn stays behind
 * one boundary and never reaches a component.
 */

export type Money = {
  amount: string;
  /**
   * Widened from the plan's literal "USD" (§29). Shopify returns a
   * CurrencyCode enum, and pinning the type to one member would make
   * the multi-currency path in §81 a type-level rewrite rather than a
   * config change. Formatting always uses whatever Shopify sent.
   */
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ProductCardModel = {
  id: string;
  handle: string;
  title: string;
  featuredImage: ShopifyImage | null;
  minPrice: Money;
  maxPrice: Money;
  availableForSale: boolean;
  /** True when at least one variant carries a selling plan (§10.1). */
  subscriptionAvailable: boolean;
};

export type ProductOptionModel = {
  id: string;
  name: string;
  values: string[];
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariantModel = {
  id: string;
  title: string;
  availableForSale: boolean;
  /** null when Shopify does not track inventory for this variant. */
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  image: ShopifyImage | null;
};

/** Extends the card model — the mapper builds detail on top of card. */
export type ProductDetailModel = ProductCardModel & {
  description: string;
  descriptionHtml: string;
  media: ShopifyImage[];
  options: ProductOptionModel[];
  variants: ProductVariantModel[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CartLineModel = {
  id: string;
  quantity: number;
  merchandiseId: string;
  productTitle: string;
  productHandle: string;
  variantTitle: string;
  image: ShopifyImage | null;
  unitPrice: Money;
  lineTotal: Money;
  /** Present only on subscription lines. Phase 2 never sets one. */
  sellingPlanName: string | null;
  availableForSale: boolean;
};

export type CartModel = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  /** Shopify's total. Excludes tax and shipping until checkout (§15.2). */
  total: Money;
  lines: CartLineModel[];
};
