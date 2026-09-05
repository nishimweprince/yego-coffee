import { describe, expect, it } from "vitest";
import { mapProductToCard, mapProductToDetail } from "./product";
import type { ApiProduct, ApiSellingPlanAllocation } from "../types.api";

function product(
  overrides: Partial<ApiProduct> = {},
): ApiProduct {
  return {
    id: "gid://shopify/Product/1",
    handle: "medium-roast",
    title: "Medium Roast",
    availableForSale: true,
    tags: [],
    productType: "",
    options: [],
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

  it("reports no selling plan group when the product has none", () => {
    expect(mapProductToCard(product()).hasSellingPlanGroup).toBe(false);
  });

  it("reports a selling plan group when one exists", () => {
    const card = mapProductToCard(
      product({
        sellingPlanGroups: { edges: [{ node: { appName: "Shopify" } }] },
      }),
    );
    expect(card.hasSellingPlanGroup).toBe(true);
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

/**
 * Subscription options come from the variant's allocation, which is the
 * only per-variant truth (§96.6) and the only authoritative price
 * (§2.1, §10.2).
 */
describe("mapProductToDetail — subscription options", () => {
  function allocation(
    overrides: Partial<{
      planPrice: string;
      interval: "DAY" | "WEEK" | "MONTH" | "YEAR";
      intervalCount: number;
      name: string;
    }> = {},
  ): ApiSellingPlanAllocation {
    const {
      planPrice = "19.00",
      interval = "WEEK",
      intervalCount = 2,
      name = "Bi-Monthly subscription",
    } = overrides;
    return {
      priceAdjustments: [
        {
          price: { amount: planPrice, currencyCode: "USD" },
          compareAtPrice: null,
        },
      ],
      sellingPlan: {
        id: "gid://shopify/SellingPlan/1",
        name,
        description: null,
        recurringDeliveries: true,
        deliveryPolicy: { interval, intervalCount },
      },
    };
  }

  function detailWith(allocations: ApiSellingPlanAllocation[]) {
    return mapProductToDetail({
      ...product(),
      description: "",
      descriptionHtml: "",
      images: { edges: [] },
      seo: null,
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/1",
              title: "12 oz",
              availableForSale: true,
              quantityAvailable: null,
              price: { amount: "19.00", currencyCode: "USD" },
              compareAtPrice: null,
              selectedOptions: [],
              image: null,
              sellingPlanAllocations: { nodes: allocations },
            },
          },
        ],
      },
    });
  }

  it("labels frequency from the delivery policy", () => {
    const [option] = detailWith([allocation()]).variants[0].subscriptionOptions;
    expect(option.frequencyLabel).toBe("Every 2 weeks");
  });

  // The store's "Weekly membership" plan bills every 60 days (§96.3).
  it("ignores a plan name that disagrees with its own policy", () => {
    const [option] = detailWith([
      allocation({ name: "Weekly membership", interval: "DAY", intervalCount: 60 }),
    ]).variants[0].subscriptionOptions;

    expect(option.name).toBe("Weekly membership");
    expect(option.frequencyLabel).toBe("Every 60 days");
  });

  it("reports no savings when Shopify's allocation matches the one-time price", () => {
    const [option] = detailWith([allocation({ planPrice: "19.00" })])
      .variants[0].subscriptionOptions;
    expect(option.savingsPercentage).toBeNull();
    expect(option.price.amount).toBe("19.00");
  });

  it("derives savings from Shopify's own numbers when there is a discount", () => {
    const [option] = detailWith([allocation({ planPrice: "16.15" })])
      .variants[0].subscriptionOptions;
    expect(option.savingsPercentage).toBe(15);
  });

  it("never reports a saving for a plan priced above the one-time price", () => {
    const [option] = detailWith([allocation({ planPrice: "21.00" })])
      .variants[0].subscriptionOptions;
    expect(option.savingsPercentage).toBeNull();
  });

  it("drops a plan that states no cadence, rather than describing it vaguely", () => {
    const base = allocation();
    const noPolicy: ApiSellingPlanAllocation = {
      ...base,
      sellingPlan: { ...base.sellingPlan, deliveryPolicy: null },
    };
    expect(detailWith([noPolicy]).variants[0].subscriptionOptions).toEqual([]);
  });

  it("leaves a variant with no allocations with no subscription options", () => {
    expect(detailWith([]).variants[0].subscriptionOptions).toEqual([]);
  });
});
