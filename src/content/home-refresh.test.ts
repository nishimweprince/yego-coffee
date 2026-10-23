import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HOME } from "@/content/home";
import { PRIMARY_NAV, UTILITY_NAV } from "@/content/navigation";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("design refresh — homepage structure", () => {
  it("adds HOME.about with a heading, two paragraphs and a story CTA", () => {
    expect(HOME.about.heading).toContain("Somerville");
    expect(HOME.about.paragraphs).toHaveLength(2);
    for (const paragraph of HOME.about.paragraphs) {
      expect(paragraph.length).toBeGreaterThan(0);
    }
    expect(HOME.about.cta.label).toBe("Read our story");
    expect(HOME.about.cta.href).toBe("/about");
  });

  it("keeps primary navigation to four items, without the quiz or Contact", () => {
    // §108: the quiz was removed at the client's request.
    expect(PRIMARY_NAV.map((link) => link.label)).toEqual([
      "Shop",
      "Subscriptions",
      "Our story",
      "Café",
    ]);
    expect(PRIMARY_NAV.map((link) => link.href)).toEqual([
      "/shop",
      "/subscriptions",
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

  it("renders the hero, statement, lineup, about, café and subscriptions in order", () => {
    const page = read("src/app/page.tsx");
    const order = [
      "<Hero",
      "<HomeStatement",
      "<HomeLineup",
      "<HomeAbout",
      "<CafeBlock",
      "<SubscriptionBlock",
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
    // Removed at the client's request (§108).
    expect(page).not.toContain("DiscoveryCards");
    expect(page).not.toContain("CoffeeFinder");
    // Both repeated something already on the page (§105).
    expect(page).not.toContain("SignatureCoffees");
    expect(page).not.toContain("FinalCta");
  });

  it("keeps the hero a Server Component, with the carousel as its one island", () => {
    const hero = read("src/components/home/hero.tsx");
    expect(hero).not.toContain("use client");
    expect(hero).toContain("<HeroCarousel");
    // The first slide's headline is the page's only <h1>.
    expect(hero).toContain('index === 0 ? "h1" : "h2"');
    expect(read("src/components/home/hero-carousel.tsx")).toContain(
      "use client",
    );
  });

  it("removes the quiz, its finder and the discovery cards outright", () => {
    for (const gone of [
      "src/app/quiz",
      "src/components/quiz",
      "src/components/home/coffee-finder.tsx",
      "src/components/home/discovery-cards.tsx",
    ]) {
      expect(existsSync(join(root, gone)), gone).toBe(false);
    }
  });
});

describe("design refresh — the quiet page", () => {
  const SECTION_FILES: Array<[marker: string, file: string]> = [
    ["<Hero", "src/components/home/hero.tsx"],
    ["<HomeStatement", "src/components/home/home-statement.tsx"],
    ["<HomeLineup", "src/components/home/home-lineup.tsx"],
    ["<HomeAbout", "src/components/home/home-about.tsx"],
    ["<CafeBlock", "src/components/home/cafe-block.tsx"],
    ["<SubscriptionBlock", "src/components/home/subscription-block.tsx"],
  ];

  it("sits on one ground: only the hero changes it", () => {
    // §108.4: the hero is soil and everything else is the paper page.
    // No tinted bands.
    const allowed: Record<string, string> = {
      "<Hero": 'data-surface="soil"',
    };
    for (const [marker, file] of SECTION_FILES) {
      const surfaces = read(file).match(/data-surface="[a-z]+"/g) ?? [];
      expect([...new Set(surfaces)], marker).toEqual(
        allowed[marker] ? [allowed[marker]] : [],
      );
    }
  });

  it("answers shipping and cancellation with a Yego line, and rules once", () => {
    // One Yego line per question a customer asks: shipping beside the
    // prices, cancellation beside the plans. Nowhere else.
    const files = SECTION_FILES.map(([, file]) => read(file));
    const count = (needle: string) =>
      files.reduce((n, source) => n + (source.match(needle) ? 1 : 0), 0);
    expect(count("<YegoLine")).toBe(2);
    // The contour is allowed twice per page; the home page now uses it
    // once, on the café's place name (§107).
    expect(count("<Contour")).toBe(1);
  });

  it("drops the decorative eyebrow from every home section", () => {
    for (const [, file] of SECTION_FILES) {
      expect(read(file), file).not.toContain('className="label text-accent"');
    }
  });

  it("points every subscription CTA at the page that can complete it", () => {
    // /collections/subscriptions listed plans; /subscriptions is the
    // page that also carries cadences, terms and the real offer.
    const home = read("src/content/home.ts");
    expect(home).not.toContain("/collections/subscriptions");
    expect(
      HOME.hero.slides.some((slide) => slide.cta.href === "/subscriptions"),
    ).toBe(true);
    expect(HOME.subscription.cta.href).toBe("/subscriptions");
  });
});

describe("design refresh — the hero carousel (§108)", () => {
  const hero = () => read("src/components/home/hero.tsx");
  const carousel = () => read("src/components/home/hero-carousel.tsx");

  it("fills the viewport and floats the chrome over the photographs", () => {
    expect(hero()).toContain("min-h-svh");
    // The stylesheet keys the floating chrome off this flag; without it
    // the header sits on a bar above the hero and it is not
    // full-screen at all.
    expect(read("src/app/page.tsx")).toContain('data-hero="slides"');
    const css = read("src/app/globals.css");
    expect(css).toContain('body:has(main[data-hero="slides"]) [data-chrome]');
    expect(css).not.toContain('data-hero="video"');
  });

  it("server-renders every slide from the owners' photographs, the first as LCP", () => {
    expect(hero()).toContain("priority={index === 0}");
    expect(HOME.hero.slides.length).toBeGreaterThan(1);
    for (const slide of HOME.hero.slides) {
      expect(slide.image.src).toMatch(/^\/brand\/hero-/);
      expect(slide.cta.label.length).toBeGreaterThan(0);
    }
    expect(existsSync(join(root, "public/brand/video"))).toBe(false);
  });

  it("holds still for anyone who asked for less motion, and can be paused", () => {
    expect(carousel()).toContain("prefers-reduced-motion");
    // WCAG 2.2.2: moving content that starts on its own can be paused.
    expect(carousel()).toContain("Pause slideshow");
    // Hidden slides cannot be tabbed into.
    expect(carousel()).toContain("inert=");
  });

  it("keeps the chrome rules out of a cascade layer", () => {
    // [data-surface] is unlayered, and an unlayered rule beats anything
    // in @layer components however specific. Inside the layer these
    // overrides lost and the announcement bar stayed opaque.
    const css = read("src/app/globals.css");
    const chrome = css.indexOf("Chrome over the hero.");
    const components = css.indexOf("@layer components");
    expect(chrome).toBeGreaterThan(-1);
    expect(chrome).toBeLessThan(components);
  });
});

describe("design refresh — one typeface", () => {
  const css = () => read("src/app/globals.css");

  it("routes all three registers at DM Sans", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain("DM_Sans");
    expect(layout).not.toMatch(/Bricolage|Newsreader|Archivo/);

    // The role hooks stay, so components keep working through the same
    // three names if a second family ever returns.
    for (const role of ["--font-display", "--font-body", "--font-utility"]) {
      expect(css()).toMatch(
        new RegExp(`${role}: var\\(--font-dm-sans\\)`),
      );
    }
  });

  it("never sets a variation axis by hand", () => {
    // The previous system separated its registers with Archivo's width
    // axis, and after that with manual optical-size settings. DM Sans
    // has no width axis and the browser handles optical size on its
    // own, so any font-variation-settings line is a leftover.
    expect(css()).not.toContain("font-variation-settings");
  });
});

describe("design refresh — chrome over the hero", () => {
  it("keeps the open mobile menu opaque", () => {
    // Regression: the chrome's transparency was applied to every
    // descendant [data-surface], which swept in the mobile menu panel.
    // Its background vanished and the links landed unreadable on the
    // hero video. The override now names the announcement bar alone,
    // and the panel declares a surface of its own.
    expect(read("src/components/layout/mobile-nav.tsx")).toContain(
      'data-surface="mist"',
    );
    const rules = read("src/app/globals.css");
    expect(rules).toContain("[data-chrome] > p[data-surface]");
    expect(rules).not.toContain("[data-chrome] [data-surface]");
  });
});

