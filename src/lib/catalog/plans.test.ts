import { describe, expect, it } from "vitest";
import { cadenceSentence, perBagPrice, summarisePlans } from "./plans";
import type { ProductDetailModel } from "@/lib/shopify/types";

function planProduct(
  handle: string,
  policies: Array<{ interval: "DAY" | "WEEK" | "MONTH"; count: number }>,
  { amount = "17.00", bags = null }: { amount?: string; bags?: number | null } = {},
): ProductDetailModel {
  return {
    id: handle,
    handle,
    title: handle,
    featuredImage: null,
    minPrice: { amount, currencyCode: "USD" },
    maxPrice: { amount, currencyCode: "USD" },
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
    requiresSellingPlan: true,
    bagsPerDelivery: bags,
    shareImageUrl: null,
    variants: [
      {
        id: `${handle}-v1`,
        title: "12 oz",
        availableForSale: true,
        quantityAvailable: null,
        price: { amount, currencyCode: "USD" },
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
          price: { amount, currencyCode: "USD" },
          compareAtPrice: null,
          savingsPercentage: null,
        })),
      },
    ],
  };
}

const BOTH = [
  { interval: "WEEK" as const, count: 2 },
  { interval: "MONTH" as const, count: 1 },
];

/** The four Roaster's Choice products as the store prices them. */
const ROASTERS_CHOICE = [
  planProduct("roasters-choice-four-bags-subscription", BOTH, { amount: "75.00", bags: 4 }),
  planProduct("roasters-choice-one-bag-subscription", BOTH, { amount: "22.00", bags: 1 }),
  planProduct("roasters-choice-three-bags-subscription", BOTH, { amount: "58.00", bags: 3 }),
  planProduct("roasters-choice-two-bags-subscription", BOTH, { amount: "40.00", bags: 2 }),
];

describe("summarisePlans", () => {
  it("labels each cadence from its delivery policy", () => {
    const [plan] = summarisePlans([
      planProduct("bi-monthly-drop", [{ interval: "WEEK", count: 2 }]),
    ]);
    expect(plan.cadences).toEqual(["Every 2 weeks"]);
  });

  // The 5 lb monthly subscription carries two plan groups, one of them
  // the 60-day plan misnamed "Weekly membership" (§96.3).
  it("lists every distinct cadence a product offers, least frequent first", () => {
    const [plan] = summarisePlans([
      planProduct("5-lb-bag-monthly-subscription", [
        { interval: "MONTH", count: 1 },
        { interval: "DAY", count: 60 },
      ]),
    ]);
    expect(plan.cadences).toEqual(["Every 60 days", "Once a month"]);
  });

  it("de-duplicates a cadence offered on several variants", () => {
    const product = planProduct("monthly-drop", [
      { interval: "MONTH", count: 1 },
      { interval: "MONTH", count: 1 },
    ]);
    expect(summarisePlans([product])[0].cadences).toEqual(["Once a month"]);
  });

  it("reports no cadence rather than a vague one when policy is absent", () => {
    const product = planProduct("odd", []);
    expect(summarisePlans([product])[0].cadences).toEqual([]);
  });

  it("orders plans by bag count when every plan states one", () => {
    expect(summarisePlans(ROASTERS_CHOICE).map((p) => p.bags)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("keeps the collection's order when a bag count is missing", () => {
    const plans = summarisePlans([
      planProduct("b", BOTH, { bags: 2 }),
      planProduct("a", BOTH),
    ]);
    expect(plans.map((p) => p.handle)).toEqual(["b", "a"]);
  });

  it("works out the per-bag price from Shopify's price", () => {
    expect(summarisePlans(ROASTERS_CHOICE).map((p) => p.perBag?.amount)).toEqual(
      ["22.00", "20.00", "19.33", "18.75"],
    );
  });

  it("measures the saving against the one-bag plan, per delivery", () => {
    expect(
      summarisePlans(ROASTERS_CHOICE).map((p) => p.savingPerDelivery?.amount ?? null),
    ).toEqual([null, "4.00", "8.00", "13.00"]);
  });

  it("claims no saving without a one-bag plan to measure against", () => {
    const plans = summarisePlans(ROASTERS_CHOICE.slice(2));
    expect(plans.every((p) => p.savingPerDelivery === null)).toBe(true);
  });

  it("shows no per-bag price when the bag count is missing", () => {
    const [plan] = summarisePlans([planProduct("monthly-drop", BOTH)]);
    expect(plan.perBag).toBeNull();
    expect(plan.savingPerDelivery).toBeNull();
  });
});

describe("perBagPrice", () => {
  it("rounds to the cent", () => {
    expect(perBagPrice({ amount: "58.00", currencyCode: "USD" }, 3)).toEqual({
      amount: "19.33",
      currencyCode: "USD",
    });
  });

  it("is null without a usable count", () => {
    expect(perBagPrice({ amount: "58.00", currencyCode: "USD" }, null)).toBeNull();
    expect(perBagPrice({ amount: "58.00", currencyCode: "USD" }, 0)).toBeNull();
  });
});

describe("cadenceSentence", () => {
  it("states every cadence once, monthly first", () => {
    expect(cadenceSentence(summarisePlans(ROASTERS_CHOICE))).toBe(
      "Delivered once a month or every 2 weeks.",
    );
  });

  it("orders cadences by interval across plans, whatever order they arrive in", () => {
    const plans = summarisePlans([
      planProduct("fortnightly", [{ interval: "WEEK", count: 2 }]),
      planProduct("monthly", [{ interval: "MONTH", count: 1 }]),
    ]);
    expect(cadenceSentence(plans)).toBe("Delivered once a month or every 2 weeks.");
  });

  it("says nothing when no plan states a cadence", () => {
    expect(cadenceSentence(summarisePlans([planProduct("odd", [])]))).toBeNull();
  });
});
