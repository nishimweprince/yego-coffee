import { describe, expect, it } from "vitest";
import { mapCart } from "./cart";
import type { ApiCart } from "../types.api";

const apiCart: ApiCart = {
  id: "gid://shopify/Cart/1",
  checkoutUrl: "https://yego.myshopify.com/cart/c/1",
  totalQuantity: 3,
  cost: {
    subtotalAmount: { amount: "57.00", currencyCode: "USD" },
    totalAmount: { amount: "57.00", currencyCode: "USD" },
  },
  lines: {
    edges: [
      {
        node: {
          id: "gid://shopify/CartLine/1",
          quantity: 3,
          cost: {
            totalAmount: { amount: "57.00", currencyCode: "USD" },
            amountPerQuantity: { amount: "19.00", currencyCode: "USD" },
          },
          sellingPlanAllocation: null,
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            title: "12 oz",
            availableForSale: true,
            image: null,
            product: { title: "Medium Roast", handle: "medium-roast" },
          },
        },
      },
    ],
  },
};

describe("mapCart", () => {
  it("carries Shopify's checkoutUrl through unmodified", () => {
    expect(mapCart(apiCart).checkoutUrl).toBe(
      "https://yego.myshopify.com/cart/c/1",
    );
  });

  it("takes both unit and line totals from Shopify rather than multiplying", () => {
    const line = mapCart(apiCart).lines[0];
    expect(line.unitPrice.amount).toBe("19.00");
    expect(line.lineTotal.amount).toBe("57.00");
  });

  it("reports no selling plan on a one-time line", () => {
    expect(mapCart(apiCart).lines[0].sellingPlanName).toBeNull();
  });

  it("surfaces a selling plan name when present", () => {
    const withPlan: ApiCart = {
      ...apiCart,
      lines: {
        edges: [
          {
            node: {
              ...apiCart.lines.edges[0].node,
              sellingPlanAllocation: {
                sellingPlan: {
                  name: "Monthly Drop",
                  deliveryPolicy: { interval: "MONTH", intervalCount: 1 },
                },
              },
            },
          },
        ],
      },
    };
    expect(mapCart(withPlan).lines[0].sellingPlanName).toBe("Monthly Drop");
  });

  /**
   * The cart is where a customer commits to a recurring charge, so the
   * frequency shown there must come from the delivery policy. This
   * store contains a plan named "Weekly membership" that bills every
   * 60 days, and "Bi-Monthly" is ambiguous in English (§92.2 #1).
   */
  it("states the cadence from the delivery policy, not the plan name", () => {
    const misnamed: ApiCart = {
      ...apiCart,
      lines: {
        edges: [
          {
            node: {
              ...apiCart.lines.edges[0].node,
              sellingPlanAllocation: {
                sellingPlan: {
                  name: "Weekly membership",
                  deliveryPolicy: { interval: "DAY", intervalCount: 60 },
                },
              },
            },
          },
        ],
      },
    };

    const line = mapCart(misnamed).lines[0];
    expect(line.sellingPlanCadence).toBe("Every 60 days");
    expect(line.sellingPlanName).toBe("Weekly membership");
  });

  it("leaves the cadence null when Shopify states no recurring policy", () => {
    const noPolicy: ApiCart = {
      ...apiCart,
      lines: {
        edges: [
          {
            node: {
              ...apiCart.lines.edges[0].node,
              sellingPlanAllocation: {
                sellingPlan: { name: "Prepaid", deliveryPolicy: null },
              },
            },
          },
        ],
      },
    };
    expect(mapCart(noPolicy).lines[0].sellingPlanCadence).toBeNull();
  });

  it("has no cadence on an ordinary one-time line", () => {
    expect(mapCart(apiCart).lines[0].sellingPlanCadence).toBeNull();
  });
});
