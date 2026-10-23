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
 * "Once a month", "Every 2 weeks", "Every 60 days".
 *
 * The fortnightly plan is named for what Shopify bills, not "twice a
 * month" (§109): every two weeks is 26 deliveries a year, not 24, and
 * a customer counting on two bags a month gets a third in some months.
 * Any other interval is described plainly.
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
  if (interval === "WEEK" && intervalCount === 2) return "Every 2 weeks";

  const unit = SINGULAR[interval];
  return intervalCount === 1
    ? `Every ${unit}`
    : `Every ${intervalCount} ${unit}s`;
}

const APPROXIMATE_DAYS: Record<Exclude<DeliveryInterval, null>, number> = {
  DAY: 1,
  WEEK: 7,
  MONTH: 30,
  YEAR: 365,
};

/**
 * Plans ordered from the least frequent delivery to the most, so the
 * calmer commitment — "Once a month" — is listed, and preselected on a
 * subscription-only product, first (§109). Ordered by the delivery
 * policy, never by a plan's name. A plan with no stated interval sorts
 * last.
 */
export function byLongestInterval<
  T extends Pick<SubscriptionOptionModel, "interval" | "intervalCount">,
>(plans: readonly T[]): T[] {
  const days = (plan: T) =>
    plan.interval && plan.intervalCount
      ? APPROXIMATE_DAYS[plan.interval] * plan.intervalCount
      : -1;
  return plans.toSorted((a, b) => days(b) - days(a));
}
