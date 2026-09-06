import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HOME } from "@/content/home";
import { PRIMARY_NAV, UTILITY_NAV } from "@/content/navigation";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("design refresh — homepage structure", () => {
  it("adds HOME.about with an eyebrow, heading, two paragraphs and a story CTA", () => {
    expect(HOME.about.eyebrow).toBe("About Yego Coffee");
    expect(HOME.about.heading).toContain("Somerville");
    expect(HOME.about.paragraphs).toHaveLength(2);
    for (const paragraph of HOME.about.paragraphs) {
      expect(paragraph.length).toBeGreaterThan(0);
    }
    expect(HOME.about.cta.label).toBe("Read our story");
    expect(HOME.about.cta.href).toBe("/about");
  });

  it("simplifies primary navigation to five items and moves Contact out", () => {
    expect(PRIMARY_NAV.map((link) => link.label)).toEqual([
      "Shop",
      "Subscriptions",
      "Find Your Coffee",
      "Our Story",
      "Café",
    ]);
    expect(PRIMARY_NAV.map((link) => link.href)).toEqual([
      "/shop",
      "/subscriptions",
      "/quiz",
      "/about",
      "/cafe",
    ]);
    expect(
      PRIMARY_NAV.some((link) => link.href === "/contact"),
    ).toBe(false);
  });

  it("groups Search, Account and Cart as utilities without changing routes", () => {
    expect(UTILITY_NAV).toEqual([
      { href: "/search", label: "Search" },
      { href: "/account", label: "Account" },
      { href: "/cart", label: "Cart" },
    ]);
  });

  it("renders Hero then About then Discovery with no carousel", () => {
    const page = read("src/app/page.tsx");
    const order = [
      "<Hero",
      "<HomeAbout",
      "discovery.heading",
      "<SignatureCoffees",
      "<CoffeeFinder",
      "<CafeBlock",
      "<SubscriptionBlock",
      "<FinalCta",
    ].map((marker) => {
      // Last occurrence: the no-credential fallback above renders a
      // subset of the same sections, so the full order reads from the
      // main return at the end of the file.
      const index = page.lastIndexOf(marker);
      expect(index, marker).toBeGreaterThanOrEqual(0);
      return index;
    });
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(page).not.toContain("BrandStatement");
    expect(page).not.toContain("HeroSlides");
  });

  it("replaces the client carousel with one static server-rendered image", () => {
    expect(
      existsSync(join(root, "src/components/home/hero-slides.tsx")),
    ).toBe(false);
    const hero = read("src/components/home/hero.tsx");
    expect(hero).not.toContain("use client");
    expect(hero).not.toContain("HeroSlides");
    expect(hero).toContain("/brand/roast.jpg");
    expect(hero).toContain("<h1");
  });
});
