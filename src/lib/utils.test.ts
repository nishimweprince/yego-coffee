import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  /**
   * Regression: tailwind-merge classified custom font sizes and
   * custom text colours into the same group and dropped one, which
   * stripped the foreground colour off every sized button.
   */
  it("keeps a custom text colour alongside a custom font size", () => {
    const result = cn("text-accent-foreground", "text-body-m");
    expect(result).toContain("text-accent-foreground");
    expect(result).toContain("text-body-m");
  });

  it("keeps a custom text colour when the size comes first", () => {
    const result = cn("text-body-m", "text-accent-foreground");
    expect(result).toContain("text-accent-foreground");
    expect(result).toContain("text-body-m");
  });

  it("still collapses two genuinely conflicting font sizes", () => {
    expect(cn("text-body-m", "text-body-l")).toBe("text-body-l");
  });

  it("still collapses two genuinely conflicting text colours", () => {
    expect(cn("text-foreground", "text-muted-foreground")).toBe(
      "text-muted-foreground",
    );
  });
});
