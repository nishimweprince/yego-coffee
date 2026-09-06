import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

describe("token registration", () => {
  /**
   * tailwind-merge cannot classify this design system's names on its
   * own: `text-lede` and `text-accent` look like the same `text-*`
   * utility to it, and it silently drops one. Adding a --text-* token
   * to globals.css without adding it to the font-size group in
   * utils.ts is therefore invisible until a colour goes missing in
   * production.
   *
   * Rather than one case per token, read the stylesheet and require
   * every size token it declares to be registered.
   */
  it("registers every --text-* token declared in globals.css", () => {
    const css = readFileSync(
      join(process.cwd(), "src/app/globals.css"),
      "utf8",
    );

    // `--text-display-xl--line-height` is a modifier on an existing
    // token, not a token of its own, so anything containing `--` is
    // skipped.
    const declared = new Set(
      [...css.matchAll(/^\s*--text-([a-z0-9-]+):/gm)]
        .map((m) => m[1])
        .filter((name) => !name.includes("--")),
    );
    expect(declared.size).toBeGreaterThan(0);

    for (const token of declared) {
      // A registered token survives being paired with a colour.
      const result = cn("text-accent-foreground", `text-${token}`);
      expect(result, `text-${token} is not in utils.ts`).toContain(
        "text-accent-foreground",
      );
      expect(result, `text-${token} is not in utils.ts`).toContain(
        `text-${token}`,
      );
    }
  });

  it("keeps the lede size alongside a colour", () => {
    const result = cn("text-muted-foreground", "text-lede");
    expect(result).toContain("text-muted-foreground");
    expect(result).toContain("text-lede");
  });
});
