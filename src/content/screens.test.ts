import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Structural guards from the screen-by-screen design pass.
 *
 * These are the habits that crept back in once the homepage was done
 * and the inner pages were left running the generic recipe. Each one
 * is cheap to reintroduce and invisible in review, which is why they
 * are asserted rather than remembered.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

function walk(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((entry) => {
    const rel = `${dir}/${entry}`;
    return statSync(join(root, rel)).isDirectory()
      ? walk(rel)
      : rel.endsWith(".tsx")
        ? [rel]
        : [];
  });
}

describe("screens — no decorative eyebrows", () => {
  it("never labels a heading with the word above it", () => {
    // `<p class="label text-accent">Café</p>` above a heading that says
    // "Come have one with us." carries nothing; it is the main thing
    // that made every section look like the last one. Links and badges
    // using the same classes are fine — this is about standalone
    // paragraphs used as eyebrows.
    const offenders: string[] = [];
    for (const file of [...walk("src/app"), ...walk("src/components")]) {
      const source = read(file);
      if (/<p className="label text-accent">/.test(source)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("screens — the lineup is laid out as a shelf (§108)", () => {
  it("never renders a fixed three-column product grid", () => {
    // Four coffees in a three-column grid is a row of three and one
    // stranded card. The shelf is two across on a phone and four from
    // a laptop up, so the four coffees fill one row exactly.
    const grid = read("src/components/commerce/product-grid.tsx");
    expect(grid).toContain("grid-cols-2");
    expect(grid).toContain("lg:grid-cols-4");

    for (const file of [
      "src/app/shop/page.tsx",
      "src/app/cart/page.tsx",
      "src/components/product/related-products.tsx",
    ]) {
      expect(read(file), file).not.toMatch(/lg:grid-cols-3/);
    }
  });

  it("features a lone journal entry instead of gridding it", () => {
    const journal = read("src/app/journal/page.tsx");
    expect(journal).toContain("const [lead, ...rest] = articles");
  });
});

describe("screens — the buying path answers questions where they are asked", () => {
  it("puts the shipping threshold in the cart and the drawer", () => {
    // It lived only on /policies, which is the one place nobody
    // deciding whether to add another bag will go.
    expect(read("src/app/cart/page.tsx")).toContain("YegoLine");
    expect(read("src/components/commerce/cart-drawer.tsx")).toContain(
      "shipping.html",
    );
    expect(read("src/app/api/cart/route.ts")).toContain("getReassurances");
  });

  it("gives the empty cart something to do", () => {
    // "Nothing here yet." is mood. An empty cart is the best
    // merchandising space on the site: the visitor is on the buying
    // path with nothing to buy.
    const cart = read("src/app/cart/page.tsx");
    expect(cart).not.toContain("Nothing here yet");
    expect(cart).toContain("ProductGrid");
    expect(cart).toContain('href="/shop"');
    // The quiz is gone (§108); nothing may still send people to it.
    expect(cart).not.toContain("/quiz");
  });

  it("states each fact on the product page exactly once", () => {
    // The specification block restated the size and grind pickers
    // directly above it, word for word.
    const pdp = read("src/app/products/[handle]/page.tsx");
    expect(pdp).not.toContain("ProductFacts");
    expect(pdp).not.toContain('label="Specification"');
    // Roast still sits with the name, unless the name already says it.
    expect(pdp).toContain("roastNote(product)");
  });
});

describe("screens — one ground, one recipe (§105)", () => {
  const SOURCE = [...walk("src/app"), ...walk("src/components")].filter(
    (file) => !file.endsWith(".test.tsx"),
  );

  /**
   * The only places a surface may change. The hero and the footer
   * invert to ink. There are no tinted bands (§108.4); the rest
   * declare `mist` because they open from chrome that may be
   * transparent over the hero (see "panels that open from the
   * chrome").
   */
  const SURFACE_FILES = new Set([
    "src/app/layout.tsx",
    "src/app/foundations/page.tsx",
    "src/components/layout/announcement-bar.tsx",
    "src/components/layout/site-footer.tsx",
    "src/components/layout/mobile-nav.tsx",
    "src/components/home/hero.tsx",
    "src/components/commerce/cart-drawer.tsx",
    "src/components/search/search-panel.tsx",
    "src/components/product/product-gallery.tsx",
  ]);

  it("changes surface only in the chrome, the hero and the footer", () => {
    const offenders = SOURCE.filter(
      (file) => !SURFACE_FILES.has(file) && /data-surface=/.test(read(file)),
    );
    expect(offenders).toEqual([]);
  });

  it("never reaches past the token system", () => {
    // Each of these was a way a page drifted from the rest: a second
    // display register, hand-mixed borders, a stock corner radius
    // outside the pill/card/field set, an uppercase label, a raw
    // palette ramp.
    const banned = [
      /type-display/,
      /type-utility/,
      /border-foreground\/\d/,
      /rounded-(sm|md|lg|xl|2xl|3xl|control)\b/,
      /\buppercase\b/,
      /\btracking-/,
      /(bg|text|border)-(soil|terrace|sage|mist|sun)-\d/,
    ];
    const offenders: string[] = [];
    for (const file of SOURCE) {
      const source = read(file);
      for (const pattern of banned) {
        if (pattern.test(source)) offenders.push(`${file}: ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("lays every page out at one of two widths", () => {
    // `page` (76rem) for columns, `prose` for a reading measure. Dialogs
    // set their own width and are not pages.
    const offenders = walk("src/app").filter((file) =>
      /max-w-[2345]xl/.test(read(file)),
    );
    expect(offenders).toEqual([]);
  });
});

describe("screens — the contour leads its content", () => {
  it("defaults to a leading label", () => {
    // A trailing label above a section puts the words a full container
    // away from what they name — on the product page "DETAILS" sat
    // ~700px right of the text it headed.
    const contour = read("src/components/ui/contour.tsx");
    expect(contour).toContain('align = "start"');
  });

  it("keeps trailing labels only where they sign off", () => {
    // The footer's sign-off repeated the address beneath it and was cut
    // (§107). With the quiz gone (§108) no trailing label is left.
    expect(read("src/components/layout/site-footer.tsx")).not.toContain("<Contour");
    const trailing = [...walk("src/app"), ...walk("src/components")].filter(
      (file) => /<Contour[^>]*align="end"/.test(read(file)),
    );
    expect(trailing).toEqual([]);
  });
});

describe("screens — panels that open from the chrome", () => {
  /**
   * Anything opened from the header is a DOM descendant of the chrome.
   * On the homepage that chrome floats over the film hero with every
   * colour inverted to paper, so a panel that does not declare its own
   * surface inherits paper text — the mobile menu lost its background
   * this way, and the search dialog rendered paper-on-white.
   *
   * Any future panel opened from the header needs the same line.
   */
  it("declares its own surface", () => {
    for (const file of [
      "src/components/layout/mobile-nav.tsx",
      "src/components/search/search-panel.tsx",
    ]) {
      expect(read(file), file).toContain('data-surface="mist"');
    }
  });
});


describe("screens — no linen (§108.4)", () => {
  it("retires the linen tint and the wash surface", () => {
    const css = read("src/app/globals.css");
    expect(css).not.toContain("--color-linen");
    expect(css).not.toContain('[data-surface="wash"]');
    const offenders = [...walk("src/app"), ...walk("src/components")].filter(
      (file) => /data-surface="wash"|\blinen\b/.test(read(file)),
    );
    expect(offenders).toEqual([]);
  });
});

describe("screens — Starbucks parity (§108.5)", () => {
  it("lays the shelf out one, two, then four across", () => {
    const grid = read("src/components/commerce/product-grid.tsx");
    expect(grid).toContain("grid-cols-1");
    expect(grid).toContain("sm:grid-cols-2");
    expect(grid).toContain("lg:grid-cols-4");
  });

  it("frames product photos at the measured 316:373 on an 8px tile", () => {
    const card = read("src/components/commerce/product-card.tsx");
    expect(card).toContain("aspect-[316/373]");
    expect(card).toContain("rounded-tile");
  });

  it("reveals on scroll, and never while motion is unwelcome", () => {
    const reveal = read("src/components/layout/reveal-observer.tsx");
    expect(reveal).toContain("use client");
    expect(reveal).toContain("prefers-reduced-motion");
    // Never touch a server-rendered element's attributes: that is a
    // hydration mismatch on streamed segments.
    expect(reveal).not.toContain("setAttribute(\"data-revealed\"");
    expect(read("src/app/layout.tsx")).toContain("<RevealObserver />");
  });

  it("crossfades page changes without a second rise (§108.6)", () => {
    // The scroll reveal moves the arriving page's content; the route
    // transition must only fade, or everything rises twice.
    const css = read("src/app/globals.css");
    const arrive = css.slice(css.indexOf("::view-transition-new(.page-arrive)"));
    expect(arrive.slice(0, arrive.indexOf("}"))).toContain("yego-fade-in");
    expect(read("src/app/template.tsx")).toContain("ViewTransition");
  });

  it("scrolls with momentum, and not for anyone who asked for less motion", () => {
    const smooth = read("src/components/layout/smooth-scroll.tsx");
    expect(smooth).toContain("prefers-reduced-motion");
    // A locked page (open drawer or viewer) must not scroll behind it.
    expect(smooth).toContain('document.body.style.overflow !== "hidden"');
    expect(read("src/app/layout.tsx")).toContain("<SmoothScroll />");
  });

  it("caps every column at 85% of the screen, header and footer included (§108.8)", () => {
    expect(read("src/app/globals.css")).toContain("--container-page: min(85vw, 85rem)");
    expect(read("src/components/layout/site-header.tsx")).toContain("max-w-page");
    expect(read("src/components/layout/site-footer.tsx")).toContain("max-w-page");
  });

  it("sizes the product page's photo column to the photo — no dead column", () => {
    const pdp = read("src/app/products/[handle]/page.tsx");
    expect(pdp).toContain("lg:grid-cols-[auto_minmax(0,32rem)]");
    expect(pdp).toContain("lg:justify-center");
  });

  it("fits the product gallery inside one screen", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain(".pdp-gallery");
    expect(css).toMatch(/100svh - var\(--gallery-offset\)/);
  });
});
