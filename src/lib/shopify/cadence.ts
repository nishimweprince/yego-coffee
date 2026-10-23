import type { SubscriptionOptionModel } from "./types";

/**
 * Subscription cadence copy, generated from Shopify's structured
 * delivery policy (plan.md §96.3).
 *
 * Yego's store contains a selling plan named "Weekly membership" whose
 * recurring delivery policy is every 60 days. Its name is wrong by a
 * factor of eight. Any cadence a customer reads — on a PDP, in the
 * cart, in an account subscription card — must be built from the
 * interval, because the name is not reliable and a customer misled
 * about their own billing frequency is the most expensive error this
 * storefront can make (§92.2 #1).
 */

export type DeliveryInterval = SubscriptionOptionModel["interval"];

const SINGULAR: Record<Exclude<DeliveryInterval, null>, string> = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

/**
 * "Once a month", "Twice a month, every 2 weeks", "Every 60 days".
 *
 * The two cadences Yego sells are named the way the owners describe
 * them (§108): once and twice a month. "Twice a month" keeps its exact
 * interval beside it, because every two weeks is not quite two
 * deliveries in every calendar month and the customer is owed the
 * real rhythm. Any other interval is described plainly.
 *
 * Returns null when Shopify states no recurring policy. Callers must
 * treat that as "cannot be described" and omit the cadence rather than
 * substituting a guess or the plan's name.
 */
export function formatCadence(
  interval: DeliveryInterval,
  intervalCount: number | null,
): string | null {
  if (!interval || !intervalCount || intervalCount < 1) return null;

  if (interval === "MONTH" && intervalCount === 1) return "Once a month";
  if (interval === "WEEK" && intervalCount === 2) {
    return "Twice a month, every 2 weeks";
  }

  const unit = SINGULAR[interval];
  return intervalCount === 1
    ? `Every ${unit}`
    : `Every ${intervalCount} ${unit}s`;
}
