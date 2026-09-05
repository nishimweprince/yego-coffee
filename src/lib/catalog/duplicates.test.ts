import { describe, expect, it } from "vitest";
import { excludeDuplicates } from "./duplicates";
import type { ProductCardModel } from "@/lib/shopify/types";

function card(handle: string): ProductCardModel {
  return {
    id: handle,
    handle,
    title: handle,
    featuredImage: null,
    minPrice: { amount: "19.00", currencyCode: "USD" },
    maxPrice: { amount: "19.00", currencyCode: "USD" },
    availableForSale: true,
    tags: [],
    productType: "",
    options: [],
    hasSellingPlanGroup: false,
  };
}

const products = [
  card("dark-roast"),
  card("dark-roast-monthly-subscription"),
  card("dark-roast-bi-monthly-subscription"),
  card("brand-new-product"),
];

const subscriptions = new Set([
  "dark-roast-monthly-subscription",
  "dark-roast-bi-monthly-subscription",
]);
const canonical = new Set(["dark-roast"]);

describe("excludeDuplicates", () => {
  it("hides the duplicate subscription products", () => {
    expect(excludeDuplicates(products, subscriptions, canonical).map((p) => p.handle))
      .toEqual(["dark-roast", "brand-new-product"]);
  });

  it("never hides a product that is in no collection at all", () => {
    const result = excludeDuplicates(products, subscriptions, canonical);
    expect(result.some((p) => p.handle === "brand-new-product")).toBe(true);
  });

  // After §92.1 the real coffees carry selling plans and may well sit in
  // the subscriptions collection. They must not disappear.
  it("keeps a product that is in both the subscriptions and a canonical collection", () => {
    const bothWays = new Set(["dark-roast", ...subscriptions]);
    expect(
      excludeDuplicates(products, bothWays, canonical).map((p) => p.handle),
    ).toContain("dark-roast");
  });

  it("changes nothing when there are no duplicates", () => {
    expect(excludeDuplicates(products, new Set(), canonical)).toHaveLength(4);
  });
});
