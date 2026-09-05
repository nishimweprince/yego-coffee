import { describe, expect, it } from "vitest";
import {
  GRAMS_PER_CUP,
  bagsPerDelivery,
  prefersBulk,
  suggestCadence,
  variantGrams,
} from "./quantity";
import { variant } from "./fixtures";
import type { SubscriptionOptionModel } from "@/lib/shopify/types";

describe("variantGrams", () => {
  it("reads a 12 oz bag from Shopify's own option value", () => {
    expect(variantGrams(variant({ id: "v" }))).toBeCloseTo(340.19, 1);
  });

  it("reads a 5 lb bag", () => {
    const v = variant({
      id: "v",
      title: "5 lbs / Ground",
      selectedOptions: [{ name: "Size", value: "5 lbs" }],
    });
    expect(variantGrams(v)).toBeCloseTo(2267.96, 1);
  });

  // The 5 lb Bag's variants are named for their roast, not their size.
  it("returns null when no weight can be read, rather than guessing", () => {
    const v = variant({
      id: "v",
      title: "Medium",
      selectedOptions: [{ name: "Roast", value: "Medium" }],
    });
    expect(variantGrams(v)).toBeNull();
  });
});

describe("bagsPerDelivery", () => {
  it("covers the cycle, rounding up so nobody runs out", () => {
    // 2 cups × 18 g × 28 days = 1008 g, against a 340 g bag.
    expect(
      bagsPerDelivery({ cupsPerDay: 2, gramsPerBag: 340, daysPerCycle: 28 }),
    ).toBe(3);
  });

  it("never recommends fewer than one bag", () => {
    expect(
      bagsPerDelivery({ cupsPerDay: 1, gramsPerBag: 2268, daysPerCycle: 14 }),
    ).toBe(1);
  });

  it("states no number when the cadence is unknown", () => {
    expect(
      bagsPerDelivery({ cupsPerDay: 2, gramsPerBag: 340, daysPerCycle: null }),
    ).toBeNull();
  });

  it("states no number when the bag weight is unknown", () => {
    expect(
      bagsPerDelivery({ cupsPerDay: 2, gramsPerBag: null, daysPerCycle: 28 }),
    ).toBeNull();
  });

  it("uses the documented grams-per-cup assumption", () => {
    expect(GRAMS_PER_CUP).toBe(18);
  });
});

function option(
  id: string,
  interval: "DAY" | "WEEK" | "MONTH",
  intervalCount: number,
): SubscriptionOptionModel {
  return {
    sellingPlanId: id,
    name: id,
    description: null,
    frequencyLabel: "",
    interval,
    intervalCount,
    price: { amount: "17.00", currencyCode: "USD" },
    compareAtPrice: null,
    savingsPercentage: null,
  };
}

describe("suggestCadence", () => {
  const monthly = option("monthly", "MONTH", 1);
  const biweekly = option("biweekly", "WEEK", 2);

  it("suggests the rhythm closest to one bag a delivery for a light drinker", () => {
    // 1 cup/day: 14 days needs 252 g, a month needs 540 g — the
    // fortnight fits one 340 g bag, the month does not.
    const chosen = suggestCadence([monthly, biweekly], {
      cupsPerDay: 1,
      gramsPerBag: 340,
    });
    expect(chosen?.sellingPlanId).toBe("biweekly");
  });

  it("suggests a shorter cycle for a heavy drinker", () => {
    const chosen = suggestCadence([monthly, biweekly], {
      cupsPerDay: 5,
      gramsPerBag: 340,
    });
    expect(chosen?.sellingPlanId).toBe("biweekly");
  });

  it("falls back to the first plan when no weight can be read", () => {
    const chosen = suggestCadence([monthly, biweekly], {
      cupsPerDay: 2,
      gramsPerBag: null,
    });
    expect(chosen?.sellingPlanId).toBe("monthly");
  });

  it("returns null when there are no plans at all", () => {
    expect(suggestCadence([], { cupsPerDay: 2, gramsPerBag: 340 })).toBeNull();
  });
});

describe("prefersBulk", () => {
  // §93.2: six or more cups a day routes toward the 5 lb bag.
  it("routes a household of heavy drinkers to bulk", () => {
    expect(prefersBulk(6)).toBe(true);
    expect(prefersBulk(12)).toBe(true);
  });

  it("leaves a normal drinker on the 12 oz bag", () => {
    expect(prefersBulk(5)).toBe(false);
    expect(prefersBulk(1)).toBe(false);
  });
});
