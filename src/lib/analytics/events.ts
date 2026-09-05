/**
 * The event taxonomy (plan.md §31.1).
 *
 * One typed union, so an event name is a compile error rather than a
 * silent no-op in a dashboard three weeks later. The payloads are
 * deliberately thin: §33 forbids sending addresses, payment data, auth
 * tokens or unnecessary customer identifiers into analytics, and the
 * cheapest way to honour that is for the types to have nowhere to put
 * them.
 */

export type AnalyticsEvent =
  // Navigation
  | { name: "search_opened" }
  | { name: "cart_opened" }
  // Product
  | { name: "product_viewed"; handle: string }
  | { name: "product_variant_changed"; handle: string; variantId: string }
  // Subscription
  | { name: "subscription_cta_clicked"; location: string }
  | { name: "selling_plan_selected"; sellingPlanId: string; cadence: string }
  | { name: "subscription_added_to_cart"; handle: string; cadence: string }
  // Quiz
  | { name: "quiz_started"; prefilled: boolean }
  | { name: "quiz_step_viewed"; step: string; index: number }
  | { name: "quiz_answered"; step: string; answer: string }
  | { name: "quiz_back_clicked"; step: string }
  | { name: "quiz_completed"; questions: number }
  | { name: "quiz_result_viewed"; handle: string; hasSubscription: boolean }
  | { name: "quiz_recommendation_changed"; cupsPerDay: number }
  | { name: "quiz_subscription_started"; handle: string }
  // Cart
  | { name: "cart_item_added"; handle: string; quantity: number }
  | { name: "cart_item_removed"; handle: string }
  | { name: "cart_quantity_changed"; handle: string; quantity: number }
  | { name: "checkout_started"; itemCount: number }
  // Search
  | { name: "search_query_submitted"; query: string }
  | { name: "predictive_result_clicked"; handle: string }
  | { name: "search_no_results"; query: string }
  | { name: "search_filter_applied"; filter: string; value: string }
  // Café
  | { name: "cafe_directions_clicked" };

export type AnalyticsEventName = AnalyticsEvent["name"];

/**
 * Fields that must never reach an analytics provider (§33).
 *
 * The types above already exclude them; this is the runtime backstop
 * for the day someone widens a payload. A dropped property is
 * recoverable — a customer's address sitting in a third-party
 * analytics account is not.
 */
const FORBIDDEN_KEYS = [
  "email",
  "address",
  "address1",
  "address2",
  "phone",
  "token",
  "accessToken",
  "password",
  "card",
  "cardNumber",
  "customerId",
];

export function stripSensitive(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    const forbidden = FORBIDDEN_KEYS.some((k) =>
      key.toLowerCase().includes(k.toLowerCase()),
    );
    if (!forbidden) safe[key] = value;
  }
  return safe;
}
