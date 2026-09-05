import { describe, expect, it } from "vitest";
import { featuredPlans, summarisePlans } from "./plans";
import type { ProductDetailModel } from "@/lib/shopify/types";

function planProduct(
  handle: string,
  policies: Array<{ interval: "DAY" | "WEEK" | "MONTH"; count: number }>,
): ProductDetailModel {
  return {
    id: handle,
    handle,
    title: handle,
    featuredImage: null,
    minPrice: { amount: "17.00", currencyCode: "USD" },
    maxPrice: { amount: "17.00", currencyCode: "USD" },
    availableForSale: true,
    tags: [],
    productType: "",
    options: [],
    hasSellingPlanGroup: policies.length > 0,
    description: "",
    descriptionHtml: "",
    media: [],
    seoTitle: null,
    seoDescription: null,
    variants: [
      {
        id: `${handle}-v1`,
        title: "12 oz",
        availableForSale: true,
        quantityAvailable: null,
        price: { amount: "17.00", currencyCode: "USD" },
        compareAtPrice: null,
        selectedOptions: [],
        image: null,
        subscriptionOptions: policies.map((p, i) => ({
          sellingPlanId: `${handle}-plan-${i}`,
          name: "plan",
          description: null,
          frequencyLabel: "",
          interval: p.interval,
          intervalCount: p.count,
          price: { amount: "17.00", currencyCode: "USD" },
          compareAtPrice: null,
          savingsPercentage: null,
        })),
      },
    ],
  };
}

describe("summarisePlans", () => {
  it("labels each cadence from its delivery policy", () => {
    const [plan] = summarisePlans([
      planProduct("bi-monthly-drop", [{ interval: "WEEK", count: 2 }]),
    ]);
    expect(plan.cadences).toEqual(["Every 2 weeks"]);
  });

  // The 5 lb monthly subscription carries two plan groups, one of them
  // the 60-day plan misnamed "Weekly membership" (§96.3).
  it("lists every distinct cadence a product offers", () => {
    const [plan] = summarisePlans([
      planProduct("5-lb-bag-monthly-subscription", [
        { interval: "MONTH", count: 1 },
        { interval: "DAY", count: 60 },
      ]),
    ]);
    expect(plan.cadences).toEqual(["Every month", "Every 60 days"]);
  });

  it("de-duplicates a cadence offered on several variants", () => {
    const product = planProduct("monthly-drop", [
      { interval: "MONTH", count: 1 },
      { interval: "MONTH", count: 1 },
    ]);
    expect(summarisePlans([product])[0].cadences).toEqual(["Every month"]);
  });

  it("reports no cadence rather than a vague one when policy is absent", () => {
    const product = planProduct("odd", []);
    expect(summarisePlans([product])[0].cadences).toEqual([]);
  });
});

describe("featuredPlans", () => {
  const plans = summarisePlans([
    planProduct("monthly-drop", [{ interval: "MONTH", count: 1 }]),
    planProduct("dark-roast-monthly-subscription", [
      { interval: "MONTH", count: 1 },
    ]),
    planProduct("bi-monthly-drop", [{ interval: "WEEK", count: 2 }]),
  ]);

  it("keeps the content file's order, not Shopify's", () => {
    expect(
      featuredPlans(plans, ["bi-monthly-drop", "monthly-drop"]).map(
        (p) => p.handle,
      ),
    ).toEqual(["bi-monthly-drop", "monthly-drop"]);
  });

  it("drops a featured handle that no longer exists", () => {
    expect(
      featuredPlans(plans, ["monthly-drop", "retired"]).map((p) => p.handle),
    ).toEqual(["monthly-drop"]);
  });

  it("falls back to everything when no featured handle matches", () => {
    expect(featuredPlans(plans, ["nothing-here"])).toHaveLength(3);
  });
});
