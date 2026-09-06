import { describe, expect, it } from "vitest";
import {
  mapAddress,
  mapOrderDetail,
  mapOrderSummary,
  mapProfile,
  mapSubscription,
} from "./mappers";

/**
 * These mappers have never seen a real response (§103.2), so what
 * matters most is how they behave when the response is not what was
 * assumed. Every test here is a shape the API might return that the
 * documentation did not promise — an absent field, a null nesting, an
 * empty connection — and the requirement is the same in all of them:
 * render a gap, never throw.
 */
describe("mapProfile", () => {
  it("maps a complete customer", () => {
    const profile = mapProfile({
      id: "gid://shopify/Customer/1",
      firstName: "Fatuma",
      lastName: "Tuyishime",
      emailAddress: { emailAddress: "f@example.com" },
      phoneNumber: { phoneNumber: "+15551234567" },
    })!;
    expect(profile.displayName).toBe("Fatuma");
    expect(profile.email).toBe("f@example.com");
  });

  // §11.2 greets by name. "Welcome back, null" is the failure to avoid.
  it("falls back to the email when there is no first name", () => {
    expect(mapProfile({ emailAddress: { emailAddress: "f@example.com" } })!.displayName)
      .toBe("f@example.com");
  });

  it("falls back again when there is no email either", () => {
    expect(mapProfile({})!.displayName).toBe("there");
  });

  it("treats an empty string as absent, not as a name", () => {
    expect(mapProfile({ firstName: "   " })!.displayName).toBe("there");
  });

  it("returns null for a null customer rather than an empty shell", () => {
    expect(mapProfile(null)).toBeNull();
  });

  it("survives a missing emailAddress nesting", () => {
    expect(() => mapProfile({ firstName: "A" })).not.toThrow();
    expect(mapProfile({ firstName: "A" })!.email).toBeNull();
  });
});

describe("mapOrderSummary", () => {
  it("maps an order with line items", () => {
    const order = mapOrderSummary({
      id: "gid://shopify/Order/1",
      name: "#1001",
      processedAt: "2026-08-01T10:00:00Z",
      financialStatus: "PAID",
      fulfillments: { nodes: [{ status: "SUCCESS" }] },
      totalPrice: { amount: "38.00", currencyCode: "USD" },
      lineItems: {
        nodes: [
          { title: "Dark Roast", quantity: 2 },
          { title: "Medium Roast", quantity: 1 },
        ],
      },
    });

    expect(order.name).toBe("#1001");
    expect(order.itemCount).toBe(3);
    expect(order.fulfillmentStatus).toBe("SUCCESS");
  });

  it("handles an order with no fulfilments yet", () => {
    const order = mapOrderSummary({ name: "#1002", fulfillments: { nodes: [] } });
    expect(order.fulfillmentStatus).toBeNull();
  });

  it("handles a missing total rather than rendering NaN", () => {
    expect(mapOrderSummary({ name: "#1003" }).total).toEqual({
      amount: "0.00",
      currencyCode: "USD",
    });
  });

  it("survives an entirely empty node", () => {
    expect(() => mapOrderSummary({})).not.toThrow();
    expect(mapOrderSummary({}).name).toBe("—");
  });
});

describe("mapOrderDetail", () => {
  it("flattens tracking across fulfilments", () => {
    const detail = mapOrderDetail({
      id: "1",
      name: "#1001",
      fulfillments: {
        nodes: [
          {
            status: "SUCCESS",
            trackingInformation: [
              { number: "1Z", url: "https://track", company: "UPS" },
            ],
          },
        ],
      },
      totalPrice: { amount: "38.00", currencyCode: "USD" },
      lineItems: { nodes: [] },
    })!;

    expect(detail.tracking).toEqual([
      { number: "1Z", url: "https://track", company: "UPS" },
    ]);
  });

  it("returns an empty tracking list when there is none", () => {
    const detail = mapOrderDetail({ name: "#1", fulfillments: { nodes: [{}] } })!;
    expect(detail.tracking).toEqual([]);
  });

  it("keeps Shopify's formatted address as given", () => {
    const detail = mapOrderDetail({
      name: "#1",
      shippingAddress: { formatted: ["1212 Broadway", "Somerville MA 02144"] },
    })!;
    expect(detail.shippingAddress).toHaveLength(2);
  });

  it("returns null for a missing order", () => {
    expect(mapOrderDetail(null)).toBeNull();
  });
});

describe("mapAddress", () => {
  it("marks the default address", () => {
    const address = mapAddress({ id: "a1", city: "Somerville" }, "a1");
    expect(address.isDefault).toBe(true);
  });

  it("does not mark others as default", () => {
    expect(mapAddress({ id: "a2" }, "a1").isDefault).toBe(false);
  });

  it("is not confused by a null default", () => {
    expect(mapAddress({ id: "a1" }, null).isDefault).toBe(false);
  });
});

describe("mapSubscription", () => {
  it("states cadence from the delivery policy, never a plan name", () => {
    const contract = mapSubscription({
      id: "s1",
      status: "ACTIVE",
      deliveryPolicy: { interval: "WEEK", intervalCount: 2 },
      lines: { nodes: [] },
    });
    expect(contract.cadence).toBe("Every 2 weeks");
  });

  it("says nothing about cadence when the contract states no policy", () => {
    expect(mapSubscription({ id: "s2", lines: { nodes: [] } }).cadence).toBeNull();
  });

  it("maps contract lines", () => {
    const contract = mapSubscription({
      id: "s3",
      lines: {
        nodes: [
          {
            id: "l1",
            name: "Dark Roast",
            quantity: 2,
            currentPrice: { amount: "17.00", currencyCode: "USD" },
          },
        ],
      },
    });
    expect(contract.lines[0]).toMatchObject({ name: "Dark Roast", quantity: 2 });
  });

  it("survives a contract with no lines connection at all", () => {
    expect(() => mapSubscription({ id: "s4" })).not.toThrow();
    expect(mapSubscription({ id: "s4" }).lines).toEqual([]);
  });

  it("defaults an unknown status rather than rendering undefined", () => {
    expect(mapSubscription({ id: "s5" }).status).toBe("UNKNOWN");
  });
});
