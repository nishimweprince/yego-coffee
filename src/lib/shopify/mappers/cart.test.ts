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
                sellingPlan: { name: "Monthly Drop" },
              },
            },
          },
        ],
      },
    };
    expect(mapCart(withPlan).lines[0].sellingPlanName).toBe("Monthly Drop");
  });
});
