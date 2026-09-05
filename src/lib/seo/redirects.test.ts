import { describe, expect, it } from "vitest";
import { REDIRECTS, activeRedirects } from "./redirects";

describe("the redirect sheet", () => {
  it("never redirects a path to itself", () => {
    for (const rule of activeRedirects()) {
      expect(rule.source).not.toBe(rule.destination);
    }
  });

  it("gives every rule a reason, since §43 asks for one", () => {
    for (const rule of REDIRECTS) {
      expect(rule.reason.length).toBeGreaterThan(10);
    }
  });

  it("keeps parameter names consistent across a rule", () => {
    for (const rule of activeRedirects()) {
      const params = rule.source.match(/:[a-z]+/gi) ?? [];
      for (const param of params) {
        expect(rule.destination).toContain(param);
      }
    }
  });

  it("has no duplicate sources, which would make the second unreachable", () => {
    const sources = REDIRECTS.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  /**
   * §92.1 proposes redirecting the duplicate subscription products to
   * their parent coffee. They are still separately purchasable today,
   * and redirecting a live product URL to a different product loses
   * both the sale and the customer's place.
   */
  it("does not redirect the duplicate subscription products yet", () => {
    const sources = REDIRECTS.map((r) => r.source);
    expect(sources.some((s) => s.includes("subscription"))).toBe(false);
    expect(sources.some((s) => s.includes("drop"))).toBe(false);
  });

  it("does not redirect product URLs, which already resolve", () => {
    expect(activeRedirects().some((r) => r.source.startsWith("/products")))
      .toBe(false);
  });
});
