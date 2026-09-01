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
