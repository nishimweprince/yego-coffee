import { describe, expect, it } from "vitest";
import { buildRecommendation } from "./recommendation";
import { DEFAULT_ANSWERS, type QuizAnswers } from "./schema";
import {
  darkRoast,
  fiveLbBag,
  gatare,
  mediumRoast,
  subscriptionProduct,
} from "./fixtures";

function answers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return { ...DEFAULT_ANSWERS, ...overrides };
}

const coffees = [mediumRoast, darkRoast, gatare, fiveLbBag];

const subscriptions = [
  subscriptionProduct("dark-roast-monthly-subscription", "MONTH", 1),
  subscriptionProduct("dark-roast-bi-monthly-subscription", "WEEK", 2),
  subscriptionProduct("medium-roast-monthly-subscription", "MONTH", 1),
  subscriptionProduct("medium-roast-bi-monthly-subscription", "WEEK", 2),
];

describe("buildRecommendation", () => {
  it("recommends a real, purchasable variant of the matching coffee", () => {
    const result = buildRecommendation(coffees, subscriptions, answers({ flavour: "rich" }))!;
    expect(result.product.handle).toBe("dark-roast");
    expect(result.variant.availableForSale).toBe(true);
  });

  it("prices from the Shopify variant, never from content", () => {
    const result = buildRecommendation(coffees, subscriptions, answers({ flavour: "bright" }))!;
    expect(result.unitPrice).toEqual(result.variant.price);
  });

  it("offers an alternate for §9.6's second match", () => {
    const result = buildRecommendation(coffees, subscriptions, answers({ flavour: "rich" }))!;
    expect(result.alternate).not.toBeNull();
    expect(result.alternate!.handle).not.toBe("dark-roast");
  });

  it("explains itself from the answers actually given", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({ flavour: "rich", cupsPerDay: 3 }),
    )!;
    expect(result.reasons.join(" ")).toContain("rich and chocolatey");
    expect(result.reasons.join(" ")).toContain("3 cups a day");
  });

  it("attaches a subscription when one genuinely exists for that coffee", () => {
    const result = buildRecommendation(coffees, subscriptions, answers({ flavour: "rich" }))!;
    expect(result.subscription).not.toBeNull();
    expect(result.subscription!.productHandle).toMatch(/^dark-roast-/);
    expect(result.subscription!.option.interval).toBeTruthy();
  });

  // Gatare has no monthly or bi-monthly subscription product (§92.1).
  // The honest outcome is a one-time purchase, not a redirect to a
  // different coffee.
  it("returns no subscription for a coffee that has none, and still recommends it", () => {
    const result = buildRecommendation(coffees, subscriptions, answers({ flavour: "bright" }))!;
    expect(result.product.handle).toBe("light-roast");
    expect(result.subscription).toBeNull();
  });

  it("degrades to one-time when the mapped subscription product is gone", () => {
    const result = buildRecommendation(coffees, [], answers({ flavour: "rich" }))!;
    expect(result.product.handle).toBe("dark-roast");
    expect(result.subscription).toBeNull();
  });

  it("degrades to one-time when the mapped product is sold out", () => {
    const soldOut = subscriptions.map((p) => ({ ...p, availableForSale: false }));
    const result = buildRecommendation(coffees, soldOut, answers({ flavour: "rich" }))!;
    expect(result.subscription).toBeNull();
  });

  it("honours a cadence the customer chose", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({
        flavour: "rich",
        sellingPlanId: "dark-roast-monthly-subscription-plan",
      }),
    )!;
    expect(result.subscription!.option.sellingPlanId).toBe(
      "dark-roast-monthly-subscription-plan",
    );
  });

  it("suggests a cadence when the customer has not chosen one", () => {
    const result = buildRecommendation(coffees, subscriptions, answers({ flavour: "rich" }))!;
    expect(result.subscription!.option.sellingPlanId).toBeTruthy();
  });

  it("picks the larger bag for a household that drinks a lot", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({ flavour: "bright", cupsPerDay: 8 }),
    )!;
    expect(result.variant.title).toContain("5 lbs");
  });

  it("picks the smaller bag for one person", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({ flavour: "bright", cupsPerDay: 1 }),
    )!;
    expect(result.variant.title).toContain("12 oz");
  });

  it("honours a grind preference", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({ flavour: "rich", grind: "whole" }),
    )!;
    expect(
      result.variant.selectedOptions.some((o) => /whole/i.test(o.value)),
    ).toBe(true);
  });

  it("returns null when the whole catalogue is unavailable", () => {
    const closed = coffees.map((p) => ({ ...p, availableForSale: false }));
    expect(buildRecommendation(closed, subscriptions, answers())).toBeNull();
  });
});

/**
 * The subscription duplicates carry two variants that differ only by
 * grind, and both are "12 oz". Matching on any shared option value
 * picked whichever came first, and handed a customer who asked for
 * ground coffee a bag of whole beans.
 */
describe("subscription variant selection", () => {
  it("subscribes to the grind the customer asked for", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({ flavour: "rich", grind: "ground" }),
    )!;
    expect(result.subscription!.variantId).toMatch(/-ground$/);
  });

  it("subscribes to whole bean when that is what they chose", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({ flavour: "rich", grind: "whole" }),
    )!;
    expect(result.subscription!.variantId).toMatch(/-whole$/);
  });

  it("still subscribes when no grind was stated", () => {
    const result = buildRecommendation(
      coffees,
      subscriptions,
      answers({ flavour: "rich", grind: null }),
    )!;
    expect(result.subscription).not.toBeNull();
  });
});
