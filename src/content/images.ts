/**
 * The brand photography (plan.md §106.4).
 *
 * Every photograph here is Yego's own, processed once from the owners'
 * originals (2400px long edge, metadata stripped). Pages import from
 * this file rather than hard-coding a path, so a reshoot is one edit.
 *
 * Several of these show bags labelled with coffee names the store does
 * not sell. They are editorial only — never a product image — and the
 * alt text describes the scene without naming a coffee, so nothing
 * here implies a SKU that does not exist (§93.5). images.test.ts
 * guards that.
 */
export type BrandImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Where a full-bleed crop should hold, as CSS object-position. Only
      set where the default centre would cut the subject. */
  focus?: string;
};

export const IMAGES = {
  founders: {
    src: "/brand/founders.jpg",
    alt: "Fatuma and Francois Tuyishime, the family behind Yego Coffee",
    width: 2400,
    height: 1601,
  },
  cafeCounter: {
    src: "/brand/cafe-counter.jpg",
    alt: "Fatuma and Francois Tuyishime behind the café counter",
    width: 2400,
    height: 1601,
  },
  roasterLoring: {
    src: "/brand/roaster-loring.jpg",
    alt: "Beans turning in the drum of the Loring roaster",
    width: 1365,
    height: 2048,
  },
  roasterBeans: {
    src: "/brand/roaster-beans.jpg",
    alt: "Freshly roasted beans pouring from the roaster into the cooling tray",
    width: 1365,
    height: 2048,
  },
  basket: {
    src: "/brand/agaseke-basket.jpg",
    alt: "Close-up of a black and natural woven basket on the café wall",
    width: 1600,
    height: 2400,
  },
  bagsOnBurlap: {
    src: "/brand/bags-on-burlap.jpg",
    alt: "Yego Coffee bags laid on burlap coffee sacks",
    width: 1200,
    height: 1600,
  },
  bagsTrio: {
    src: "/brand/bags-trio.jpg",
    alt: "Three Yego Coffee bags standing on a reflective surface",
    width: 1200,
    height: 1600,
  },
  bagsLineup: {
    src: "/brand/bags-lineup.jpg",
    alt: "A row of Yego Coffee bags, each with the gorilla illustration",
    width: 1600,
    height: 1200,
  },
  bagFilling: {
    src: "/brand/bag-filling.jpg",
    alt: "Scooping freshly roasted beans into a Yego Coffee bag",
    width: 1200,
    height: 1600,
  },
  roasterPortrait: {
    src: "/brand/roaster-portrait.jpg",
    alt: "A member of the Yego team filling a bag beside the roaster",
    width: 1200,
    height: 1600,
  },
  /* The hero carousel (§108). Supplied by the owners on 2026-10-23.
     The two portrait frames crop hard on a wide screen, so each holds
     its subject: the printed sack, the stream of beans. The sack's
     print names Gatare, which the store sells as its light roast, so
     naming it is true. */
  heroSacks: {
    src: "/brand/hero-gatare-sacks.jpg",
    alt: "Jute sacks of green coffee stamped Product of Rwanda, Natural coffee, Gatare C.W.S.",
    width: 1333,
    height: 2000,
    focus: "50% 62%",
  },
  heroRoasterDrop: {
    src: "/brand/hero-roaster-drop.jpg",
    alt: "Roasted beans tumbling from the roaster's door into the cooling tray",
    width: 1333,
    height: 2000,
    focus: "50% 58%",
  },
  heroRoasterInspecting: {
    src: "/brand/hero-roaster-inspecting.jpg",
    alt: "A roaster leans over the cooling tray, checking the beans under a lamp",
    width: 2000,
    height: 1333,
    focus: "60% 50%",
  },
} as const satisfies Record<string, BrandImage>;
