import { describe, expect, it } from "vitest";
import { mapProductToCard } from "./product";
import type { ApiProduct } from "../types.api";

function product(
  overrides: Partial<ApiProduct> = {},
): ApiProduct {
  return {
    id: "gid://shopify/Product/1",
    handle: "medium-roast",
    title: "Medium Roast",
    availableForSale: true,
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount: "19.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "19.00", currencyCode: "USD" },
    },
    ...overrides,
  };
}

describe("mapProductToCard", () => {
  it("carries Shopify's price through untouched", () => {
    const card = mapProductToCard(product());
    expect(card.minPrice).toEqual({ amount: "19.00", currencyCode: "USD" });
  });

  it("reports no subscription when the product has no selling plan groups", () => {
    expect(mapProductToCard(product()).subscriptionAvailable).toBe(false);
  });

  it("reports a subscription when a selling plan group exists", () => {
    const card = mapProductToCard(
      product({
        sellingPlanGroups: { edges: [{ node: { appName: "Shopify" } }] },
      }),
    );
    expect(card.subscriptionAvailable).toBe(true);
  });

  it("normalises a missing image to null rather than a partial object", () => {
    expect(mapProductToCard(product()).featuredImage).toBeNull();
  });

  it("maps an image when present", () => {
    const card = mapProductToCard(
      product({
        featuredImage: {
          url: "https://cdn.shopify.com/x.jpg",
          altText: null,
          width: 1200,
          height: 1200,
        },
      }),
    );
    expect(card.featuredImage?.url).toBe("https://cdn.shopify.com/x.jpg");
  });
});
