import { describe, expect, it } from "vitest";
import { formatLongDate, humanise, orderStatusLabel } from "./format";

describe("account formatting (§111)", () => {
  it("humanises without renaming", () => {
    expect(humanise("PARTIALLY_FULFILLED")).toBe("Partially fulfilled");
    expect(humanise(null)).toBe("Unknown");
  });

  it("says nothing for an unreadable date", () => {
    expect(formatLongDate(null)).toBeNull();
    expect(formatLongDate("not a date")).toBeNull();
    expect(formatLongDate("2026-11-10T12:00:00Z")).toMatch(/November 10, 2026/);
  });

  it.each([
    [{ cancelledAt: "2026-11-01", fulfillmentStatus: "SUCCESS" }, "Cancelled"],
    [{ cancelledAt: null, fulfillmentStatus: null }, "Unfulfilled"],
    [{ cancelledAt: null, fulfillmentStatus: "SUCCESS" }, "Fulfilled"],
    [{ cancelledAt: null, fulfillmentStatus: "OPEN" }, "Open"],
  ])("%o → %s", (order, label) => {
    expect(orderStatusLabel(order)).toBe(label);
  });
});
