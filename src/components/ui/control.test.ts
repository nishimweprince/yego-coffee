import { describe, expect, it } from "vitest";
import { controlMark, controlVariants, inputClassName } from "./control";

describe("controlVariants", () => {
  it("rounds by role and draws the token border", () => {
    // Small controls take the control corner; the tall answer card is
    // a surface and takes the surface corner. Exactly one each.
    const corner = { chip: "rounded-pill", square: "rounded-pill", row: "rounded-card", card: "rounded-card" } as const;
    for (const shape of ["chip", "square", "row", "card"] as const) {
      const classes = controlVariants({ shape });
      expect(classes.match(/\brounded-\S+/g)).toEqual([corner[shape]]);
      expect(classes).toContain("border-border");
      expect(classes).not.toMatch(/border-foreground\/\d/);
    }
  });

  it("inverts a selected choice to ink", () => {
    const classes = controlVariants({ state: "active" });
    expect(classes).toContain("bg-foreground");
    expect(classes).toContain("text-background");
    expect(classes).not.toContain("border-border");
  });

  it("keeps an outlined choice on the page ground", () => {
    const classes = controlVariants({ state: "outlined" });
    expect(classes).toContain("border-foreground");
    expect(classes).not.toContain("bg-foreground");
  });
});

describe("controlMark", () => {
  it("fills when active and swaps to the background colour on ink", () => {
    expect(controlMark(false)).toContain("border-rule");
    expect(controlMark(true)).toContain("bg-foreground");
    expect(controlMark(true, true)).toContain("bg-background");
  });
});

describe("inputClassName", () => {
  it("uses the token border and the elevated surface", () => {
    expect(inputClassName).toContain("border-border");
    expect(inputClassName).toContain("bg-surface-elevated");
    expect(inputClassName).not.toMatch(/border-foreground\/\d/);
  });
});
