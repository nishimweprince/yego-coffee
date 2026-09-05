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
  /**
   * Shopify's product tags. Yego's store has no metafields (§96.4), so
   * this is the only structured signal about a coffee — roast lives
   * here as `light` / `medium` / `dark`.
   */
  tags: string[];
  productType: string;
  /**
   * Option names and values. On the card as well as the detail model
   * because roast lives here for the 5 lb Bag (§96.4).
   */
  options: ProductOptionModel[];
  /**
   * The product carries a selling plan group. NOT "you can subscribe to
   * this variant" — Gatare's group covers only its 5 lb variant (§96.6).
   * Per-variant truth is `ProductVariantModel.subscriptionOptions`.
   */
  hasSellingPlanGroup: boolean;
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

/**
 * A subscription a customer can actually buy: this variant, this plan
 * (§29). `frequencyLabel` is generated from the plan's recurring
 * delivery policy and never from `sellingPlan.name` — this store has a
 * plan named "Weekly membership" that bills every 60 days (§96.3).
 */
export type SubscriptionOptionModel = {
  sellingPlanId: string;
  /** Shopify's own plan name. Display only, never a source of cadence. */
  name: string;
  description: string | null;
  /** Derived from deliveryPolicy, e.g. "Every 2 weeks". */
  frequencyLabel: string;
  interval: "DAY" | "WEEK" | "MONTH" | "YEAR" | null;
  intervalCount: number | null;
  /** Price on the plan, from Shopify's allocation (§10.2). */
  price: Money;
  compareAtPrice: Money | null;
  /**
   * Null when the plan carries no adjustment. Every plan in Yego's
   * store is currently 0% (§96.5), so this is null everywhere and no
   * savings claim may be rendered.
   */
  savingsPercentage: number | null;
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
  /** Empty when this variant cannot be subscribed to (§96.6). */
  subscriptionOptions: SubscriptionOptionModel[];
};

/** Extends the card model — the mapper builds detail on top of card. */
export type ProductDetailModel = ProductCardModel & {
  description: string;
  descriptionHtml: string;
  media: ShopifyImage[];
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
  /** Shopify's plan name. Display only — never a source of cadence. */
  sellingPlanName: string | null;
  /**
   * Generated from the plan's delivery policy, e.g. "Every 2 weeks".
   *
   * The cart is where a customer commits to a recurring charge, and
   * Shopify's plan names do not reliably describe it: this store has a
   * "Weekly membership" that bills every 60 days, and a "Bi-Monthly
   * subscription" whose own name is ambiguous in English (§92.2 #1,
   * §96.3). Null when Shopify states no recurring policy.
   */
  sellingPlanCadence: string | null;
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

export type CollectionModel = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: ProductCardModel[];
};

export type SearchSuggestion = {
  text: string;
};

export type PredictiveSearchModel = {
  products: ProductCardModel[];
  suggestions: SearchSuggestion[];
};

export type SearchResultsModel = {
  products: ProductCardModel[];
  totalCount: number;
  hasNextPage: boolean;
  endCursor: string | null;
};

export type PageModel = {
  handle: string;
  title: string;
  bodyHtml: string;
  summary: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type PolicyModel = {
  handle: string;
  title: string;
  bodyHtml: string;
};

export type ArticleModel = {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml: string | null;
  publishedAt: string;
  image: ShopifyImage | null;
  seoTitle: string | null;
  seoDescription: string | null;
};
