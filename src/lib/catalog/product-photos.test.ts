import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCT_PHOTOS } from "@/content/product-photos";
import type {
  CartLineModel,
  ProductCardModel,
  ProductDetailModel,
} from "@/lib/shopify/types";
import {
  brandPhotoFor,
  coffeeKeyOf,
  coffeeKeyOfTitle,
  photoForLine,
  withBrandPhotos,
  withCartLinePhoto,
} from "./product-photos";

const money = { amount: "17.0", currencyCode: "USD" };
const heic = {
  url: "https://cdn.shopify.com/s/files/IMG_1532.heic",
  altText: null,
  width: 3024,
  height: 4032,
};
const jpeg = {
  url: "https://cdn.shopify.com/s/files/added-later.jpg",
  altText: null,
  width: 1000,
  height: 1000,
};

function card(handle: string): ProductCardModel {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: handle,
    availableForSale: true,
    tags: [],
    productType: "",
    options: [],
    featuredImage: heic,
    minPrice: money,
    maxPrice: money,
    hasSellingPlanGroup: false,
  };
}

function detail(handle: string): ProductDetailModel {
  return {
    ...card(handle),
    description: "",
    descriptionHtml: "",
    media: [heic, jpeg],
    variants: [],
    seoTitle: null,
    seoDescription: null,
    requiresSellingPlan: false,
    bagsPerDelivery: null,
    shareImageUrl: null,
  };
}

describe("coffeeKeyOf", () => {
  it.each([
    ["medium-roast", "medium"],
    ["dark-roast", "dark"],
    ["light-roast", "light"],
    ["5-lb-bag", "bulk"],
    ["dark-roast-monthly-subscription", "dark"],
    ["medium-roast-bi-monthly-subscription", "medium"],
    ["5-lb-bag-bi-monthly-subscription", "bulk"],
  ])("%s → %s", (handle, key) => {
    expect(coffeeKeyOf(handle)).toBe(key);
  });

  it.each([
    "roasters-choice-two-bags-subscription",
    "monthly-drop",
    "bi-monthly-drop",
    "yego-mug",
  ])("%s keeps its own photographs", (handle) => {
    expect(coffeeKeyOf(handle)).toBeNull();
  });
});

describe("coffeeKeyOfTitle", () => {
  it.each([
    ["Dark Roast - Monthly Subscription", "dark"],
    ["Medium Roast", "medium"],
    ["Gatare Anaerobic Process.", "light"],
    ["5 lb Bag - Bi-Monthly Subscription", "bulk"],
    ["Roaster's Choice - One Bag Subscription", null],
    ["Monthly Drop", null],
    ["Mug", null],
  ])("%s → %s", (title, key) => {
    expect(coffeeKeyOfTitle(title)).toBe(key);
  });
});

describe("withBrandPhotos", () => {
  it("leads a tile with the studio photograph", () => {
    const result = withBrandPhotos(card("dark-roast"));
    expect(result.featuredImage?.url).toBe(PRODUCT_PHOTOS.dark[0].src);
    expect(result.featuredImage?.altText).toBe(PRODUCT_PHOTOS.dark[0].alt);
  });

  it("puts the studio set first and drops the HEIC duplicates", () => {
    const result = withBrandPhotos(detail("light-roast"));
    const urls = result.media.map((m) => m.url);
    expect(urls.slice(0, PRODUCT_PHOTOS.light.length)).toEqual(
      PRODUCT_PHOTOS.light.map((p) => p.src),
    );
    expect(urls).not.toContain(heic.url);
    // A real JPEG the owners add later still follows.
    expect(urls.at(-1)).toBe(jpeg.url);
  });

  it("leaves Roaster's Choice untouched", () => {
    const product = detail("roasters-choice-one-bag-subscription");
    expect(withBrandPhotos(product)).toBe(product);
  });

  it("does not change price or title", () => {
    const product = card("medium-roast-monthly-subscription");
    const result = withBrandPhotos(product);
    expect(result.minPrice).toBe(product.minPrice);
    expect(result.title).toBe(product.title);
  });
});

describe("withCartLinePhoto", () => {
  it("matches the tile's photograph", () => {
    const line = {
      productHandle: "5-lb-bag",
      image: heic,
    } as unknown as CartLineModel;
    expect(withCartLinePhoto(line).image).toEqual(brandPhotoFor("bulk"));
  });
});

describe("product photography files", () => {
  const all = Object.entries(PRODUCT_PHOTOS).flatMap(([key, photos]) =>
    photos.map((p) => [key, p] as const),
  );

  it.each(all)("%s: %o exists in public/", (_, photo) => {
    expect(existsSync(join(process.cwd(), "public", photo.src))).toBe(true);
  });

  it.each(all)("%s photo names the product, never the bag label", (_, photo) => {
    expect(photo.alt.trim()).not.toBe("");
    expect(photo.alt).not.toMatch(/ukuri|hobe|heritage/i);
  });

  it("every coffee has at least three photographs", () => {
    for (const photos of Object.values(PRODUCT_PHOTOS)) {
      expect(photos.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("photoForLine", () => {
  it("prefers the studio photograph for a known coffee", () => {
    expect(photoForLine("Dark Roast - Monthly Subscription", jpeg)).toEqual(
      brandPhotoFor("dark"),
    );
  });

  it("keeps Shopify's JPEG for anything else", () => {
    expect(photoForLine("Roaster's Choice - One Bag Subscription", jpeg)).toBe(jpeg);
  });

  it("never returns a HEIC", () => {
    expect(photoForLine("Mug", heic)).toBeNull();
  });
});
