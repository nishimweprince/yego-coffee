import { formatCadence } from "@/lib/shopify/cadence";
import type { ProductDetailModel, Money } from "@/lib/shopify/types";

/**
 * A subscription product, summarised for a listing (plan.md §8.7,
 * §90.07).
 *
 * Cadences are the distinct delivery intervals a customer can actually
 * choose, generated from each plan's `deliveryPolicy`. A plan whose
 * policy Shopify does not state contributes no label rather than a
 * vague one (§96.3).
 */
export type SubscriptionPlanSummary = {
  handle: string;
  title: string;
  minPrice: Money;
  maxPrice: Money;
  cadences: string[];
};

export function summarisePlans(
  products: ProductDetailModel[],
): SubscriptionPlanSummary[] {
  return products.map((product) => {
    const cadences = new Set<string>();
    for (const variant of product.variants)
      for (const option of variant.subscriptionOptions) {
        const label = formatCadence(option.interval, option.intervalCount);
        if (label) cadences.add(label);
      }

    return {
      handle: product.handle,
      title: product.title,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      cadences: [...cadences],
    };
  });
}

/**
 * Orders and narrows a plan list to the featured handles (§90.07),
 * preserving the content file's order. Falls back to everything when
 * no featured handle matches, so a renamed product empties a section
 * of the homepage only if the whole set disappears.
 */
export function featuredPlans(
  plans: SubscriptionPlanSummary[],
  featuredHandles: readonly string[],
): SubscriptionPlanSummary[] {
  const ordered = featuredHandles
    .map((handle) => plans.find((plan) => plan.handle === handle))
    .filter((plan): plan is SubscriptionPlanSummary => plan !== undefined);

  return ordered.length > 0 ? ordered : plans;
}
