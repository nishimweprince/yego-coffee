/**
 * The homepage script (plan.md §90 — the build target; §7 and §8 remain
 * the structural spec).
 *
 * Copy is §90's, verbatim. Products are referenced by handle and never
 * by price, title or image: those come from Shopify at render time
 * (§57, §2.1).
 *
 * Two of §90's sections are absent, deliberately:
 *
 *   §90.08 social proof — §90 requires verifiable sources and §71
 *     forbids fabricating testimonials. There are none to show yet.
 *   §90.09 journal — the three named entries are unwritten, and the
 *     journal itself is Phase 7.
 *
 * Both are omitted rather than stubbed. An empty testimonial carousel
 * says the brand has no customers.
 */

export type DiscoveryCard = {
  label: string;
  /** Handle of the coffee this card leads to, or null for the quiz. */
  productHandle: string | null;
  /** Prefills the quiz's flavour step (§9.2, §93.2). */
  quizAnswer: string;
};

export const HOME = {
  hero: {
    eyebrow: "Coffee subscriptions",
    headline: "Fresh coffee on repeat.",
    body: "Pick your roast and delivery rhythm. We roast in Somerville and ship it fresh, so the good coffee never runs out.",
    primaryCta: { label: "Build My Subscription", href: "/collections/subscriptions" },
    secondaryCta: { label: "Find My Coffee", href: "/quiz" },
    /** Verified facts only (§88): ownership, roastery, market. */
    trust: ["Family owned", "Roasted in Somerville", "Ships across the US"],
  },

  about: {
    eyebrow: "About Yego Coffee",
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
     * §90.02's cards. Three lead to a real coffee; the fourth opens the
     * quiz. §90.02 maps "Bright & Complex" to Gatare, which is the
     * `light-roast` handle — they are one product (§96.3).
     */
    cards: [
      {
        label: "Bright & Complex",
        productHandle: "light-roast",
        quizAnswer: "bright",
      },
      {
        label: "Rich & Chocolatey",
        productHandle: "dark-roast",
        quizAnswer: "rich",
      },
      {
        label: "Smooth & Balanced",
        productHandle: "medium-roast",
        quizAnswer: "smooth",
      },
      { label: "Surprise Me", productHandle: null, quizAnswer: "unsure" },
    ] satisfies DiscoveryCard[],
  },

  signature: {
    heading: "Signature coffees",
    /**
     * §90.03's descriptors, keyed by handle. The list of coffees comes
     * from Shopify's `roasted-coffee` collection — this only supplies
     * the editorial line, and a coffee without one still renders.
     *
     * §90.03 lists "Light Roast" and "Gatare" separately; they are the
     * same product (§96.3), so there are three descriptors, not four.
     * Each is consistent with the product's own Shopify description.
     */
    descriptors: {
      "medium-roast": "everyday, balanced",
      "dark-roast": "bold, roasty",
      "light-roast": "limited, single-origin story coffee",
    } as Record<string, string>,
  },

  statement: {
    headline: "YEGO MEANS YES.",
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
    /** Factual reassurances: cadences exist in the store, the account
     * page manages subscriptions, every bag is roasted before it ships. */
    benefits: [
      "Monthly or every two months",
      "Roasted before it ships",
      "Manage it from your account",
    ],
    cta: { label: "Build My Subscription", href: "/collections/subscriptions" },
  },

  finalCta: {
    headline: "Your next coffee is waiting.",
    primaryCta: { label: "Find My Coffee", href: "/quiz" },
    secondaryCta: {
      label: "See Subscription Options",
      href: "/collections/subscriptions",
    },
  },
} as const;
