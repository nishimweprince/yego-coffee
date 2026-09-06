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
      "<DiscoveryCards",
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

  it("keeps the hero a Server Component with no carousel", () => {
    expect(
      existsSync(join(root, "src/components/home/hero-slides.tsx")),
    ).toBe(false);
    const hero = read("src/components/home/hero.tsx");
    expect(hero).not.toContain("use client");
    expect(hero).not.toContain("HeroSlides");
    expect(hero).toContain("<h1");
  });
});

describe("design refresh — the terraced page", () => {
  /**
   * The homepage's rhythm is carried by the [data-surface] bands, not
   * by decoration. Two adjacent sections sharing a ground is exactly
   * the flat-field monotony this refresh removed, so it is worth a
   * guard: the only permitted repeat is Hero into About, which read as
   * one opening movement by design.
   */
  const SECTION_FILES: Array<[marker: string, file: string]> = [
    ["<Hero", "src/components/home/hero.tsx"],
    ["<HomeAbout", "src/components/home/home-about.tsx"],
    ["<DiscoveryCards", "src/components/home/discovery-cards.tsx"],
    ["<SignatureCoffees", "src/components/home/signature-coffees.tsx"],
    ["<CoffeeFinder", "src/components/home/coffee-finder.tsx"],
    ["<CafeBlock", "src/components/home/cafe-block.tsx"],
    ["<SubscriptionBlock", "src/components/home/subscription-block.tsx"],
    ["<FinalCta", "src/components/home/final-cta.tsx"],
  ];

  const surfaceOf = (file: string) =>
    read(file).match(/data-surface="([a-z]+)"/)?.[1] ?? "mist";

  it("never repeats a ground on adjacent sections", () => {
    const surfaces = SECTION_FILES.map(([, file]) => surfaceOf(file));

    for (let i = 1; i < surfaces.length; i += 1) {
      expect(
        surfaces[i],
        `${SECTION_FILES[i][0]} repeats the ground above it`,
      ).not.toBe(surfaces[i - 1]);
    }
  });

  it("saturates exactly one band, at the commitment moment", () => {
    const ochre = SECTION_FILES.filter(([, file]) => surfaceOf(file) === "ochre");
    expect(ochre.map(([marker]) => marker)).toEqual(["<SubscriptionBlock"]);
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
    expect(HOME.hero.primaryCta.href).toBe("/subscriptions");
    expect(HOME.subscription.cta.href).toBe("/subscriptions");
    expect(HOME.finalCta.secondaryCta.href).toBe("/subscriptions");
  });
});

describe("design refresh — the film hero", () => {
  const hero = () => read("src/components/home/hero.tsx");

  it("fills the viewport and floats the chrome over the footage", () => {
    expect(hero()).toContain("min-h-svh");
    // The stylesheet keys the floating chrome off this flag; without it
    // the header sits on a bar above the video and the hero is not
    // full-screen at all.
    expect(read("src/app/page.tsx")).toContain('data-hero="video"');
    const css = read("src/app/globals.css");
    expect(css).toContain('body:has(main[data-hero="video"]) [data-chrome]');
  });

  it("renders a poster still on the server as well as the film", () => {
    // The still is the LCP element and the fallback for every browser
    // that will not or cannot play the video.
    expect(hero()).toContain("hero-coffee-poster.jpg");
    expect(hero()).toContain("hero-coffee.webm");
    expect(hero()).toContain("priority");
  });

  it("skips the video entirely under reduced motion", () => {
    const video = read("src/components/home/hero-video.tsx");
    expect(video).toContain("use client");
    expect(video).toContain("prefers-reduced-motion");
    // Returning null before the element exists is what keeps the file
    // from being downloaded at all — hiding it with CSS would still
    // fetch and decode it.
    expect(video).toContain("if (!allowed) return null;");
  });

  it("keeps the chrome rules out of a cascade layer", () => {
    // [data-surface] is unlayered, and an unlayered rule beats anything
    // in @layer components however specific. Inside the layer these
    // overrides lost and the announcement bar stayed opaque.
    const css = read("src/app/globals.css");
    const chrome = css.indexOf("Chrome over film.");
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

  it("never varies a width axis, because DM Sans has none", () => {
    // The previous system separated its registers with Archivo's width
    // axis. On this face "wdth" is silently ignored, so a leftover
    // setting would read as a register that simply stopped working.
    const declarations = css()
      .split("\n")
      .filter((line) => line.includes("font-variation-settings"));
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) {
      expect(declaration).not.toContain("wdth");
    }
  });
});

describe("design refresh — chrome over film", () => {
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

