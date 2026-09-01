import { describe, expect, it } from "vitest";
import { formatMoney, formatMoneyCompact } from "./money";

describe("formatMoney", () => {
  it("formats USD in en-US", () => {
    expect(formatMoney({ amount: "19.00", currencyCode: "USD" })).toBe("$19.00");
  });

  it("uses the currency Shopify returned, not a hardcoded symbol", () => {
    expect(formatMoney({ amount: "1200", currencyCode: "JPY" })).toBe("¥1,200");
  });

  it("keeps cents when they are significant", () => {
    expect(formatMoney({ amount: "17.45", currencyCode: "USD" })).toBe("$17.45");
  });

  it("throws on a non-numeric amount rather than rendering NaN", () => {
    expect(() => formatMoney({ amount: "", currencyCode: "USD" })).toThrow(
      TypeError,
    );
  });
});

describe("formatMoneyCompact", () => {
  it("drops .00 on whole amounts", () => {
    expect(formatMoneyCompact({ amount: "19.00", currencyCode: "USD" })).toBe(
      "$19",
    );
  });

  it("keeps cents when present", () => {
    expect(formatMoneyCompact({ amount: "17.45", currencyCode: "USD" })).toBe(
      "$17.45",
    );
  });
});
