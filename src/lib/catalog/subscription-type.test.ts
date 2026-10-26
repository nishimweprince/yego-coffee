import { describe, expect, it } from "vitest";
import {
  bagCountFromHandle,
  getSubscriptionType,
  regularCoffeeKey,
  regularCoffeeTitle,
  regularSibling,
  splitSubscriptionType,
} from "./subscription-type";

/** Verbatim from the live store, 2026-10-26, <meta> fragments and all. */
const DARK_ROAST_HTML =
  '<p><meta charset="utf-8"><meta charset="utf-8"><span>This dense mountain coffee produces the most aromatic dark roast profile.</span><br></p>\n<p><span>Subscription type: Regular Subscription. You choose one specific coffee, and we will ship it to you either monthly or twice a month.</span></p>';

const ROASTERS_CHOICE_HTML =
  "<p>Roaster's Choice: our roasting team picks the freshest coffee for every delivery.</p>\n<p>Subscription type: Roaster's Choice Subscription. We feature several coffee processes in different roast profiles. Each month, we will select a coffee for you based on our shipment schedule from Rwanda.</p>";

describe("getSubscriptionType", () => {
  it("reads the owners' paragraph first", () => {
    expect(
      getSubscriptionType({
        handle: "anything",
        description: "Subscription type: Regular Subscription. You choose…",
      }),
    ).toBe("regular");
    expect(
      getSubscriptionType({
        handle: "anything",
        description: "Subscription type: Roaster’s Choice Subscription. We…",
      }),
    ).toBe("roasters-choice");
  });

  it("falls back to the handle, placing the Drops under Roaster's Choice", () => {
    expect(getSubscriptionType({ handle: "monthly-drop" })).toBe(
      "roasters-choice",
    );
    expect(getSubscriptionType({ handle: "bi-monthly-drop" })).toBe(
      "roasters-choice",
    );
    expect(
      getSubscriptionType({ handle: "roasters-choice-two-bags-subscription" }),
    ).toBe("roasters-choice");
    expect(
      getSubscriptionType({ handle: "5-lb-bag-bi-monthly-subscription" }),
    ).toBe("regular");
  });

  it("is null for a coffee that is not a subscription product", () => {
    expect(getSubscriptionType({ handle: "dark-roast", description: "" })).toBe(
      null,
    );
  });
});

describe("splitSubscriptionType", () => {
  it("lifts out the owners' sentence without its lead-in", () => {
    expect(splitSubscriptionType(DARK_ROAST_HTML).text).toBe(
      "You choose one specific coffee, and we will ship it to you either monthly or twice a month.",
    );
    expect(splitSubscriptionType(ROASTERS_CHOICE_HTML).text).toBe(
      "We feature several coffee processes in different roast profiles. Each month, we will select a coffee for you based on our shipment schedule from Rwanda.",
    );
  });

  it("leaves the rest of the description for Details", () => {
    const { detailsHtml } = splitSubscriptionType(DARK_ROAST_HTML);
    expect(detailsHtml).toContain("dense mountain coffee");
    expect(detailsHtml).not.toContain("Subscription type");
  });

  it("changes nothing when there is no such paragraph", () => {
    const html = "<p>A curated, rotating selection.</p>";
    expect(splitSubscriptionType(html)).toEqual({
      text: null,
      detailsHtml: html,
    });
  });
});

describe("Regular siblings", () => {
  const handles = [
    "dark-roast-monthly-subscription",
    "dark-roast-bi-monthly-subscription",
    "5-lb-bag-monthly-subscription",
  ];

  it("pairs the monthly and every-2-weeks products of one coffee", () => {
    expect(regularSibling("dark-roast-monthly-subscription", handles)).toBe(
      "dark-roast-bi-monthly-subscription",
    );
    expect(regularSibling("dark-roast-bi-monthly-subscription", handles)).toBe(
      "dark-roast-monthly-subscription",
    );
  });

  it("is null when the sibling is not published", () => {
    expect(regularSibling("5-lb-bag-monthly-subscription", handles)).toBe(
      null,
    );
    expect(regularSibling("monthly-drop", handles)).toBe(null);
  });

  it("keys and titles both siblings as the one coffee", () => {
    expect(regularCoffeeKey("dark-roast-bi-monthly-subscription")).toBe(
      "dark-roast",
    );
    expect(regularCoffeeTitle("5 lb Bag - Bi-Monthly Subscription")).toBe(
      "5 lb Bag",
    );
    expect(regularCoffeeTitle("Dark Roast - Monthly Subscription")).toBe(
      "Dark Roast",
    );
  });
});

describe("bagCountFromHandle", () => {
  it("reads the bag count the title states", () => {
    expect(bagCountFromHandle("roasters-choice-one-bag-subscription")).toBe(1);
    expect(bagCountFromHandle("roasters-choice-four-bags-subscription")).toBe(
      4,
    );
  });

  it("is null for anything else", () => {
    expect(bagCountFromHandle("monthly-drop")).toBe(null);
  });
});
