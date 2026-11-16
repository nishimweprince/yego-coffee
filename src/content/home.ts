/**
 * The homepage script (plan.md §90 — the build target; §7 and §8 remain
 * the structural spec).
 *
 * Copy is §90's, verbatim. Products are referenced by handle and never
 * by price, title or image: those come from Shopify at render time
 * (§57, §2.1).
 *
 * §108 (client feedback, 2026-10-23) replaced the film with a carousel
 * of the owners' own photographs and removed the discovery cards, the
 * finder and the quiz behind it, and the "Never run out" section.
 *
 * Four of §90's sections are absent, deliberately:
 *
 *   §90.03 signature coffees — it showed the same three coffees the
 *     discovery cards had just shown, with the same prices (§105).
 *   §90.08 social proof — §90 requires verifiable sources and §71
 *     forbids fabricating testimonials. There are none to show yet.
 *   §90.09 journal — the three named entries are unwritten, and the
 *     journal itself is Phase 7.
 *   §90.10 closing call to action — it repeated the hero's two
 *     buttons a third time (§105).
 *
 * All are omitted rather than stubbed. An empty testimonial carousel
 * says the brand has no customers.
 */

import { ABOUT } from "@/content/about";
import { IMAGES, type BrandImage } from "@/content/images";

export type HeroSlide = {
  image: BrandImage;
  headline: string;
  body: string;
  cta: { label: string; href: string };
};

export const HOME = {
  /**
   * The hero carousel, one slide per photograph: the roaster's drop,
   * the check, then the green sacks it all starts from (owner order,
   * 2026-10-26). The first headline is the page's one <h1>. Every
   * line restates something the site already says elsewhere (the about
   * copy, the statement's principles) — nothing here is new fact.
   */
  hero: {
    slides: [
      {
        image: IMAGES.heroRoasterDrop,
        headline: "Roasted fresh in Somerville.",
        body: "We roast, pack and ship it fresh, once or twice a month, so the good coffee never runs out.",
        cta: { label: "Start a subscription", href: "/subscriptions#choose" },
      },
      {
        image: IMAGES.heroRoasterInspecting,
        headline: "Family-owned, four decades in coffee.",
        body: "Fatuma and Francois Tuyishime roast every bag at their Somerville roastery and café.",
        cta: { label: "More about us", href: "/about" },
      },
      {
        image: IMAGES.heroSacks,
        headline: "Grown with purpose, in Rwanda.",
        body: "Every bag starts as green coffee from Rwanda, where the family's story begins.",
        cta: { label: "Shop coffee", href: "/shop" },
      },
    ] satisfies HeroSlide[],
  },

  /** The live store's About copy, verbatim (see content/about.ts).
   * The homepage carries the first paragraph only; the second is on
   * /about, one click away. Whole paragraphs, never trimmed words. */
  about: {
    heading: ABOUT.heading,
    paragraphs: [ABOUT.paragraphs[0]],
    cta: { label: "More about us", href: "/about" },
  },

  /** The line under the hero: what the shop sells, in plain words,
   * and the way in. Facts only — Rwandan coffee, the Somerville
   * roastery, whole bean or ground, shipping within the United States. */
  statement: {
    headline: "Rwandan coffee, roasted in Somerville.",
    lede: "Whole bean or ground, shipped fresh across the United States.",
    cta: { label: "Shop coffee", href: "/shop" },
  },

  lineup: {
    heading: "Our coffee",
    cta: { label: "Shop all coffee", href: "/shop/coffee" },
  },

  cafe: {
    heading: "Come have one with us.",
  },

  subscription: {
    heading: "Coffee subscriptions",
    /** How a Roaster's Choice box works: the customer chooses the bags,
     * the grind and the schedule; the roasting team chooses the coffee
     * (§109). Shown under that shelf only — a Regular subscriber picks
     * their coffee, so the last step would be untrue for them (§110). */
    roastersChoiceSteps: [
      "Choose how many bags",
      "Choose whole bean or ground, and how often",
      "We pick the coffee, roast it, and send it",
    ],
    /** True of both kinds (§110): the customer picks the coffee or
     * the roasters do. Cadences are not named here — they come from
     * Shopify, on the chooser and under each shelf. */
    lede: "Pick your coffee, or let us pick for you. Freshly roasted in Somerville and managed from your account.",
    cta: { label: "Start a subscription", href: "/subscriptions" },
  },
} as const;
