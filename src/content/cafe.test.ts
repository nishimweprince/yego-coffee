import { describe, expect, it } from "vitest";
import { CAFE } from "./cafe";

/**
 * The café content is an outward-facing surface: an address people
 * travel to, and a guard (§91) that fails production deploys while any
 * value on it is unconfirmed.
 *
 * This catches an unverified value in the unit suite rather than
 * fifteen minutes into a deploy, which is where it surfaced last time.
 */
describe("café content", () => {
  it("carries nothing unverified", () => {
    const unresolved = Object.entries(CAFE.provisional)
      .filter(([, provisional]) => provisional)
      .map(([field]) => field);

    expect(
      unresolved,
      `${unresolved.join(", ")} would fail the production build (§91). ` +
        `Confirm the values with the owners or remove them.`,
    ).toEqual([]);
  });

  it("does not carry a phone number or opening hours at all", () => {
    // Deleted rather than flagged: unverified data that nothing
    // displays is not worth the risk of one day being displayed.
    expect(CAFE).not.toHaveProperty("phone");
    expect(CAFE).not.toHaveProperty("hours");
  });

  it("keeps the confirmed address intact", () => {
    expect(CAFE.fullAddress).toBe("1212 Broadway, Somerville, MA 02144");
    // encodeURIComponent, so spaces are %20 rather than +.
    expect(CAFE.directionsUrl).toContain("1212%20Broadway");
  });
});
