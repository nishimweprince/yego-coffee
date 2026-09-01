import { describe, expect, it } from "vitest";
import {
  defaultVariant,
  findVariant,
  isOptionValueAvailable,
  selectionFromVariant,
} from "./variants";
import type { ProductVariantModel } from "./types";

function variant(
  id: string,
  options: Array<[string, string]>,
  availableForSale = true,
): ProductVariantModel {
  return {
    id,
    title: options.map(([, v]) => v).join(" / "),
    availableForSale,
    quantityAvailable: null,
    price: { amount: "19.00", currencyCode: "USD" },
    compareAtPrice: null,
    selectedOptions: options.map(([name, value]) => ({ name, value })),
    image: null,
  };
}

const variants = [
  variant("v1", [["Size", "12 oz"], ["Grind", "Whole bean"]]),
  variant("v2", [["Size", "12 oz"], ["Grind", "Ground"]], false),
  variant("v3", [["Size", "5 lb"], ["Grind", "Whole bean"]]),
];

describe("findVariant", () => {
  it("matches on the full option set", () => {
    const found = findVariant(variants, { Size: "12 oz", Grind: "Ground" });
    expect(found?.id).toBe("v2");
  });

  it("returns null when no variant matches", () => {
    expect(findVariant(variants, { Size: "5 lb", Grind: "Ground" })).toBeNull();
  });

  it("returns null for an empty selection rather than the first variant", () => {
    expect(findVariant(variants, {})).toBeNull();
  });
});

describe("defaultVariant", () => {
  it("prefers a sellable variant", () => {
    expect(defaultVariant([variants[1], variants[0]])?.id).toBe("v1");
  });

  it("falls back to the first variant so sold-out products still render", () => {
    const soldOut = [variant("a", [["Size", "12 oz"]], false)];
    expect(defaultVariant(soldOut)?.id).toBe("a");
  });

  it("returns null for a product with no variants", () => {
    expect(defaultVariant([])).toBeNull();
  });
});

describe("isOptionValueAvailable", () => {
  it("is false when the combination exists but is sold out", () => {
    expect(
      isOptionValueAvailable(variants, { Size: "12 oz" }, "Grind", "Ground"),
    ).toBe(false);
  });

  it("is true when the combination is sellable", () => {
    expect(
      isOptionValueAvailable(variants, { Size: "12 oz" }, "Grind", "Whole bean"),
    ).toBe(true);
  });

  it("is false when the combination does not exist at all", () => {
    expect(
      isOptionValueAvailable(variants, { Size: "5 lb" }, "Grind", "Ground"),
    ).toBe(false);
  });
});

describe("selectionFromVariant", () => {
  it("round-trips through findVariant", () => {
    const selection = selectionFromVariant(variants[2]);
    expect(findVariant(variants, selection)?.id).toBe("v3");
  });
});
