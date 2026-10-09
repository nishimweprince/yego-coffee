/**
 * The homepage script (plan.md §90 — the build target; §7 and §8 remain
 * the structural spec).
 *
 * Copy is §90's, verbatim. Products are referenced by handle and never
 * by price, title or image: those come from Shopify at render time
 * (§57, §2.1).
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

export type DiscoveryCard = {
  label: string;
  /** Handle of the coffee this card leads to. */
  productHandle: string;
};

export const HOME = {
  hero: {
    headline: "Fresh coffee on repeat.",
    body: "Pick your roast and delivery rhythm. We roast in Somerville and ship it fresh, so the good coffee never runs out.",
    primaryCta: { label: "Start a subscription", href: "/subscriptions" },
    secondaryCta: { label: "Find my coffee", href: "/quiz" },
  },

  about: {
    heading: "Family coffee, from Rwanda to Somerville.",
    paragraphs: [
      "Yego Coffee is family-owned by Fatuma and Francois Tuyishime. Yego is Kinyarwanda for yes, the family's answer as they rebuilt around coffee.",
      "The family roast in Somerville, Massachusetts, and ship across the United States from their roastery and cafe.",
    ],
    cta: { label: "Read our story", href: "/about" },
  },

  discovery: {
    heading: "How do you take your coffee?",
    /**
     * One card per coffee. §90.02's fourth card opened the quiz; the
     * finder section directly below does that with a photograph, so
     * the card was a second door to the same room (§107). §90.02 maps
     * "Bright & Complex" to Gatare, which is the `light-roast` handle —
     * they are one product (§96.3).
     */
    cards: [
      { label: "Bright & Complex", productHandle: "light-roast" },
      { label: "Rich & Chocolatey", productHandle: "dark-roast" },
      { label: "Smooth & Balanced", productHandle: "medium-roast" },
    ] satisfies DiscoveryCard[],
  },

  statement: {
    headline: "Yego means yes.",
    body: [
      "A word of affirmation.",
      "A family's answer to rebuilding after loss.",
      "Now, a promise in every bag.",
    ],
    principles: [
      "Grown with purpose, in Rwanda",
      "Roasted with care, in Somerville",
      "Family-owned, four decades in coffee",
      "Community before commodity",
    ],
  },

  finder: {
    heading: "Not sure where to start?",
    /**
     * §93.4: no question count until the quiz is final. §90.05's own
     * note says a wrong number is an immediately visible broken
     * promise.
     */
    body: [
      "A few questions. About 30 seconds.",
      "We will match you to a roast and a rhythm.",
    ],
    cta: { label: "Start the quiz", href: "/quiz" },
  },

  cafe: {
    heading: "Come have one with us.",
  },

  subscription: {
    heading: "Never run out of good coffee.",
    /**
     * §90.07 names four plans. The store publishes eight, because it
     * also carries a per-roast duplicate for Medium and Dark (§92.1) —
     * eight near-identical rows is a configuration artefact, not a
     * merchandising decision. These four are §90.07's, in its order;
     * the rest are one click away in the subscriptions collection.
     *
     * A handle that stops existing simply drops out, and if none match
     * the section falls back to everything Shopify returns.
     */
    featuredHandles: [
      "monthly-drop",
      "bi-monthly-drop",
      "5-lb-bag-monthly-subscription",
      "5-lb-bag-bi-monthly-subscription",
    ],
    steps: [
      "Choose your roast",
      "Tell us how often you brew",
      "We roast, pack, and send it",
    ],
    /** Factual only: cadences exist in the store, the account page
     * manages subscriptions, every bag is roasted before it ships. */
    lede: "Monthly or every two months, roasted before it ships, and managed from your account.",
    cta: { label: "Start a subscription", href: "/subscriptions" },
  },
} as const;
