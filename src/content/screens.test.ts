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

describe("screens — the lineup is laid out for its size", () => {
  it("never renders a fixed three-column product grid", () => {
    // Four coffees in a three-column grid is a row of three and one
    // stranded card; one mug is a card beside two empty cells.
    const grid = read("src/components/commerce/product-grid.tsx");
    expect(grid).toContain("COLUMNS");
    expect(grid).toContain("products.length");

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
    expect(cart).toContain("/quiz");
  });

  it("states each fact on the product page exactly once", () => {
    // The specification block restated the size and grind pickers
    // directly above it, word for word.
    const pdp = read("src/app/products/[handle]/page.tsx");
    expect(pdp).not.toContain("ProductFacts");
    expect(pdp).not.toContain('label="Specification"');
    expect(pdp).toContain("ROAST_LABELS");
  });
});

describe("screens — inner pages carry the band system", () => {
  it("gives every major screen more than one ground", () => {
    // The terraced surfaces stopped at the homepage, which is why the
    // inner pages still read as the generic recipe.
    for (const file of [
      "src/app/shop/page.tsx",
      "src/app/about/page.tsx",
      "src/app/quiz/page.tsx",
      "src/app/cart/page.tsx",
      "src/components/product/related-products.tsx",
    ]) {
      expect(read(file), file).toMatch(/data-surface="(soil|wash|ochre)"/);
    }
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
    expect(read("src/components/layout/site-footer.tsx")).toContain(
      'align="end"',
    );
    expect(read("src/components/quiz/quiz-shell.tsx")).toContain('align="end"');
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

