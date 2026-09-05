/**
 * Which subscription product sells which coffee (plan.md §92.1).
 *
 * In a consolidated store this file would not exist: a coffee would
 * carry its own selling plans and the quiz would add
 * `{ merchandiseId: variant, sellingPlanId: plan }` to the cart and be
 * done (§10.1). Yego's store instead sells subscriptions as separate
 * products, so the link between "the coffee you were recommended" and
 * "the thing you can subscribe to" exists nowhere in the API.
 *
 * It is written here rather than inferred from handles, because a
 * handle-prefix rule would silently mis-map the first product that
 * broke the pattern, and this is a billing relationship — the wrong
 * link charges someone for a coffee they did not choose.
 *
 * Every entry below was read from the live store on 2026-09-05. Both
 * are verified at runtime: a mapping whose product has vanished, or
 * which carries no selling plan, degrades to a one-time purchase
 * rather than to a broken checkout.
 *
 * §92.1 deletes this file.
 */
export const SUBSCRIPTION_PRODUCT_FOR_COFFEE: Record<string, string[]> = {
  // Medium Roast → its two subscription duplicates
  "medium-roast": [
    "medium-roast-monthly-subscription",
    "medium-roast-bi-monthly-subscription",
  ],
  // Dark Roast → its two
  "dark-roast": [
    "dark-roast-monthly-subscription",
    "dark-roast-bi-monthly-subscription",
  ],
  // The 5 lb Bag keeps its roast option on the subscription products.
  "5-lb-bag": [
    "5-lb-bag-monthly-subscription",
    "5-lb-bag-bi-monthly-subscription",
  ],
  // Gatare (`light-roast`) has no monthly or bi-monthly subscription
  // product. Its only selling plan is the 60-day one attached to the
  // 5 lb variant, and it is deliberately not listed here: the quiz says
  // plainly that this coffee is not available as a subscription yet
  // rather than routing the customer to a different coffee.
};
