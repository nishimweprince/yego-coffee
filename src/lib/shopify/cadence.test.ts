import { describe, expect, it } from "vitest";
import { cadenceInDays, formatCadence } from "./cadence";

/**
 * The stakes here are §92.2 #1: a customer misled about billing
 * frequency. Yego's store contains a plan named "Weekly membership"
 * whose policy is every 60 days, so these tests exist to keep cadence
 * copy tied to the policy.
 */
describe("formatCadence", () => {
  it("says 'Every month' rather than 'Every 1 months'", () => {
    expect(formatCadence("MONTH", 1)).toBe("Every month");
  });

  it("describes the bi-monthly plan by its real interval", () => {
    expect(formatCadence("WEEK", 2)).toBe("Every 2 weeks");
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

describe("cadenceInDays", () => {
  it("converts each interval to days for the quantity estimate", () => {
    expect(cadenceInDays("DAY", 60)).toBe(60);
    expect(cadenceInDays("WEEK", 2)).toBe(14);
    expect(cadenceInDays("MONTH", 1)).toBe(30);
    expect(cadenceInDays("YEAR", 1)).toBe(365);
  });

  it("returns null when there is no policy to convert", () => {
    expect(cadenceInDays(null, 2)).toBeNull();
  });
});
