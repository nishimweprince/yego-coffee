import { describe, expect, it } from "vitest";
import { formatCadence } from "./cadence";

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

  it("names the fortnightly plan 'Twice a month' and keeps its real interval", () => {
    expect(formatCadence("WEEK", 2)).toBe("Twice a month, every 2 weeks");
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
