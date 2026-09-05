import { describe, expect, it } from "vitest";
import { articleJsonLd, breadcrumbJsonLd, productJsonLd } from "./structured-data";
import { darkRoast, gatare, product, variant } from "@/lib/quiz/fixtures";
import type { ArticleModel } from "@/lib/shopify/types";

describe("productJsonLd", () => {
  it("prices from Shopify's own range", () => {
    const ld = productJsonLd(gatare, "https://x/products/light-roast");
    expect(ld.offers).toMatchObject({
      lowPrice: "25.00",
      highPrice: "150.00",
      priceCurrency: "USD",
    });
  });

  it("reports availability from the variants, not from a flag", () => {
    const soldOut = product({
      handle: "x",
      variants: [variant({ id: "v", availableForSale: false })],
    });
    expect((soldOut && productJsonLd(soldOut, "https://x").offers as Record<string, unknown>).availability)
      .toBe("https://schema.org/OutOfStock");
  });

  it("marks a product with a sellable variant as in stock", () => {
    const offers = productJsonLd(darkRoast, "https://x").offers as Record<
      string,
      unknown
    >;
    expect(offers.availability).toBe("https://schema.org/InStock");
  });

  it("omits an empty description rather than emitting a blank field", () => {
    expect(productJsonLd(darkRoast, "https://x").description).toBeUndefined();
  });
});

describe("articleJsonLd", () => {
  const article: ArticleModel = {
    id: "1",
    handle: "welcome",
    title: "Welcome",
    excerpt: "A note",
    contentHtml: "<p>Hello</p>",
    publishedAt: "2026-08-01T00:00:00Z",
    image: null,
    seoTitle: null,
    seoDescription: null,
  };

  it("carries the publication date Shopify holds", () => {
    expect(articleJsonLd(article, "https://x/journal/welcome").datePublished)
      .toBe("2026-08-01T00:00:00Z");
  });

  it("omits the image key entirely when there is no image", () => {
    expect(articleJsonLd(article, "https://x").image).toBeUndefined();
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers positions from one", () => {
    const ld = breadcrumbJsonLd([
      { name: "Shop", url: "https://x/shop" },
      { name: "Dark Roast", url: "https://x/products/dark-roast" },
    ]);
    expect(ld.itemListElement).toMatchObject([
      { position: 1, name: "Shop" },
      { position: 2, name: "Dark Roast" },
    ]);
  });
});
