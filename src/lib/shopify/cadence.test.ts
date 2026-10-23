import { describe, expect, it } from "vitest";
import { byLongestInterval, formatCadence } from "./cadence";

/**
 * The stakes here are §92.2 #1: a customer misled about billing
 * frequency. Yego's store contains a plan named "Weekly membership"
 * whose policy is every 60 days, so these tests exist to keep cadence
 * copy tied to the policy.
 */
describe("formatCadence", () => {
  it("names the monthly plan 'Once a month'", () => {
    expect(formatCadence("MONTH", 1)).toBe("Once a month");
  });

  it("names the fortnightly plan by its interval, not 'twice a month'", () => {
    expect(formatCadence("WEEK", 2)).toBe("Every 2 weeks");
  });

  it("describes any other interval plainly", () => {
    expect(formatCadence("WEEK", 1)).toBe("Every week");
    expect(formatCadence("MONTH", 2)).toBe("Every 2 months");
  });

  it("describes the mislabelled plan as the 60 days it actually bills", () => {
    expect(formatCadence("DAY", 60)).toBe("Every 60 days");
  });

  it("returns null when Shopify states no recurring policy", () => {
    expect(formatCadence(null, null)).toBeNull();
    expect(formatCadence("WEEK", null)).toBeNull();
    expect(formatCadence(null, 2)).toBeNull();
  });

  it("returns null for a nonsensical interval count", () => {
    expect(formatCadence("WEEK", 0)).toBeNull();
    expect(formatCadence("WEEK", -1)).toBeNull();
  });
});

describe("byLongestInterval", () => {
  it("puts the monthly plan before the fortnightly one", () => {
    const plans = byLongestInterval([
      { interval: "WEEK" as const, intervalCount: 2 },
      { interval: "MONTH" as const, intervalCount: 1 },
    ]);
    expect(plans.map((p) => p.interval)).toEqual(["MONTH", "WEEK"]);
  });

  it("sorts a plan with no stated interval last", () => {
    const plans = byLongestInterval([
      { interval: null, intervalCount: null },
      { interval: "WEEK" as const, intervalCount: 2 },
    ]);
    expect(plans.map((p) => p.interval)).toEqual(["WEEK", null]);
  });
});
