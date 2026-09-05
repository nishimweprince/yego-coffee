import { describe, expect, it } from "vitest";
import {
  availableRoasts,
  filterByRoast,
  parseRoastParam,
  roastParamValue,
  roastsOf,
} from "./facets";
import type { ProductCardModel, ProductDetailModel } from "@/lib/shopify/types";

function card(
  handle: string,
  tags: string[] = [],
  options: Array<{ name: string; values: string[] }> = [],
): ProductCardModel {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: handle,
    featuredImage: null,
    minPrice: { amount: "19.00", currencyCode: "USD" },
    maxPrice: { amount: "19.00", currencyCode: "USD" },
    availableForSale: true,
    tags,
    productType: "",
    options: options.map((o, i) => ({ id: `o${i}`, ...o })),
    hasSellingPlanGroup: false,
  };
}

function detail(
  handle: string,
  tags: string[],
  options: Array<{ name: string; values: string[] }>,
): ProductDetailModel {
  return {
    ...card(handle, tags, options),
    description: "",
    descriptionHtml: "",
    media: [],
    variants: [],
    seoTitle: null,
    seoDescription: null,
  };
}

describe("roastsOf", () => {
  it("reads roast from Shopify's product tags", () => {
    expect(roastsOf(card("medium-roast", ["coffee", "medium", "roast"]))).toEqual([
      "medium",
    ]);
  });

  it("ignores tags that are not roasts", () => {
    expect(roastsOf(card("mug", ["merch", "ceramic"]))).toEqual([]);
  });

  it("is case- and whitespace-insensitive, since tags are free text", () => {
    expect(roastsOf(card("x", [" Dark ", "LIGHT"]))).toEqual(["dark", "light"]);
  });

  // The 5 lb Bag carries every roast as an option rather than a tag.
  it("reads roast from a Roast option when the product has one", () => {
    const bag = detail("5-lb-bag", ["coffee", "dark", "medium", "roast"], [
      { name: "Roast", values: ["Light", "Medium", "Dark"] },
    ]);
    expect(roastsOf(bag).sort()).toEqual(["dark", "light", "medium"]);
  });

  // The listing page has only card models; the 5 lb Bag's roasts live
  // in its options, and filtering on tags alone hid it from ?roast=light.
  it("reads roast from a card's options too, not only a detail's", () => {
    const bag = card("5-lb-bag", ["coffee", "dark", "medium"], [
      { name: "Roast", values: ["Light", "Medium", "Dark"] },
    ]);
    expect(roastsOf(bag).sort()).toEqual(["dark", "light", "medium"]);
  });

  it("does not duplicate a roast present in both tags and options", () => {
    const p = detail("x", ["dark"], [{ name: "Roast", values: ["Dark"] }]);
    expect(roastsOf(p)).toEqual(["dark"]);
  });

  it("ignores options that are not the roast option", () => {
    const p = detail("x", [], [{ name: "Size", values: ["12 oz", "5 lbs"] }]);
    expect(roastsOf(p)).toEqual([]);
  });
});

describe("filterByRoast", () => {
  const products = [
    card("light-roast", ["coffee", "light"]),
    card("medium-roast", ["coffee", "medium"]),
    card("dark-roast", ["coffee", "dark"]),
    card("mug", []),
  ];

  it("returns everything when nothing is selected", () => {
    expect(filterByRoast(products, [])).toHaveLength(4);
  });

  it("matches any of the selected roasts, not all of them", () => {
    const result = filterByRoast(products, ["light", "dark"]);
    expect(result.map((p) => p.handle)).toEqual(["light-roast", "dark-roast"]);
  });

  it("excludes products with no roast at all", () => {
    expect(filterByRoast(products, ["medium"]).map((p) => p.handle)).toEqual([
      "medium-roast",
    ]);
  });
});

describe("availableRoasts", () => {
  it("offers only roasts that are actually on the shelf", () => {
    const result = availableRoasts([
      card("a", ["light"]),
      card("b", ["dark"]),
      card("c", ["dark"]),
    ]);
    expect(result).toEqual([
      { value: "light", label: "Light", count: 1 },
      { value: "dark", label: "Dark", count: 2 },
    ]);
  });

  it("returns nothing for a catalogue with no roast data", () => {
    expect(availableRoasts([card("mug", [])])).toEqual([]);
  });
});

describe("query string round-trip", () => {
  it("parses a comma-separated selection", () => {
    expect(parseRoastParam("light,dark")).toEqual(["light", "dark"]);
  });

  it("drops unknown values instead of failing the page", () => {
    expect(parseRoastParam("light,chartreuse")).toEqual(["light"]);
  });

  it("de-duplicates a repeated value", () => {
    expect(parseRoastParam("dark,dark")).toEqual(["dark"]);
  });

  it("treats an absent parameter as no filter", () => {
    expect(parseRoastParam(undefined)).toEqual([]);
  });

  it("serialises in a stable order so URLs do not churn", () => {
    expect(roastParamValue(["dark", "light"])).toBe("light,dark");
    expect(roastParamValue(["light", "dark"])).toBe("light,dark");
  });

  it("omits the parameter entirely when nothing is selected", () => {
    expect(roastParamValue([])).toBeNull();
  });
});
