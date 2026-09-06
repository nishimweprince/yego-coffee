import { describe, expect, it } from "vitest";
import { splitPolicySections } from "./policies";

const CANCELLATION =
  "<strong>Cancellation Policy</strong> <br /> Some items may be offered as a subscription. " +
  "<br /> <strong>Subscriptions</strong> <br /> You can cancel or change at any time. " +
  "<br /> <strong>Pre-orders</strong> <br /> You can cancel an unfulfilled pre-order.";

describe("splitPolicySections", () => {
  it("splits strong-headed sections in order", () => {
    expect(splitPolicySections(CANCELLATION)).toEqual([
      {
        heading: "Cancellation Policy",
        html: "Some items may be offered as a subscription.",
      },
      {
        heading: "Subscriptions",
        html: "You can cancel or change at any time.",
      },
      {
        heading: "Pre-orders",
        html: "You can cancel an unfulfilled pre-order.",
      },
    ]);
  });

  it("returns heading-less bodies as a single null-headed section", () => {
    expect(splitPolicySections("Just a paragraph.")).toEqual([
      { heading: null, html: "Just a paragraph." },
    ]);
  });

  it("keeps text before the first heading", () => {
    expect(splitPolicySections("Intro. <strong>One</strong> Body.")).toEqual([
      { heading: null, html: "Intro." },
      { heading: "One", html: "Body." },
    ]);
  });

  it("returns nothing for empty bodies", () => {
    expect(splitPolicySections("   ")).toEqual([]);
    expect(splitPolicySections("<strong>Empty</strong> <br />")).toEqual([]);
  });
});
