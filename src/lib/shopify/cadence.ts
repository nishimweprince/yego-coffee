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
 * "Every 2 weeks", "Every month", "Every 60 days".
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

  const unit = SINGULAR[interval];
  return intervalCount === 1
    ? `Every ${unit}`
    : `Every ${intervalCount} ${unit}s`;
}

/**
 * Days between deliveries, for the quiz's quantity maths (§9.5).
 * Months are approximated at 30 days; the estimate is presented as an
 * estimate (§9.5 forbids promising exact consumption).
 */
export function cadenceInDays(
  interval: DeliveryInterval,
  intervalCount: number | null,
): number | null {
  if (!interval || !intervalCount || intervalCount < 1) return null;

  const days = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 }[interval];
  return days * intervalCount;
}
