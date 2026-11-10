import type { BrandImage } from "./images";

/**
 * The product photography (plan.md §111).
 *
 * The owners' studio photographs of the store's own coffees, processed
 * once from the originals (2400px long edge, metadata stripped). Each
 * bag's label carries a name of its own, and the owners confirmed on
 * 2026-11-10 which product each one is:
 *
 *   Ukuri label     Medium Roast
 *   Heritage label  Dark Roast
 *   Hobe label      Gatare Anaerobic Process (`light-roast`)
 *   kraft bag       5 lb Bag
 *
 * Alt text names the product as the store sells it, never the label,
 * so a customer reading it meets the same name as on the shelf. The
 * 5 lb Bag is shown with a Medium label because Medium and Dark are
 * the roasts it is sold in.
 *
 * These lead each product's gallery and tile; Shopify's own
 * photographs follow (owner decision, §111). `withBrandPhotos` in
 * `src/lib/catalog/product-photos.ts` applies them — never hard-code a
 * `/brand/products/` path in a component.
 */

export type CoffeeKey = "medium" | "dark" | "light" | "bulk";

const PORTRAIT = { width: 1800, height: 2400 } as const;
const LANDSCAPE = { width: 2400, height: 1800 } as const;

export const PRODUCT_PHOTOS: Record<CoffeeKey, readonly BrandImage[]> = {
  medium: [
    {
      src: "/brand/products/medium-plant.jpg",
      alt: "A bag of Yego Medium Roast beside a leafy plant",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/medium-with-kraft.jpg",
      alt: "Yego Medium Roast in its gorilla bag, with a kraft bag behind",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/medium-plant-close.jpg",
      alt: "Yego Medium Roast bag reflected on a dark surface, framed by leaves",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/medium-reflection.jpg",
      alt: "A bag of Yego Medium Roast standing on a reflective counter",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/medium-white-and-kraft.jpg",
      alt: "Yego Medium Roast in front of a kraft bag of the same coffee",
      ...PORTRAIT,
    },
  ],
  dark: [
    {
      src: "/brand/products/dark-plant.jpg",
      alt: "A bag of Yego Dark Roast beside a leafy plant",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/dark-plant-side.jpg",
      alt: "Yego Dark Roast bag and its reflection, leaves in the foreground",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/dark-plant-wide.jpg",
      alt: "A bag of Yego Dark Roast on a dark counter beside a plant",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/dark-reflection.jpg",
      alt: "A bag of Yego Dark Roast standing on a reflective counter",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/dark-landscape.jpg",
      alt: "Yego Dark Roast bag seen from the side, behind green leaves",
      ...LANDSCAPE,
    },
  ],
  light: [
    {
      src: "/brand/products/light-plant.jpg",
      alt: "A bag of Yego Gatare Anaerobic Process beside a leafy plant",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/light-plant-close.jpg",
      alt: "Yego Gatare Anaerobic Process bag and its reflection, leaves beside it",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/light-reflection.jpg",
      alt: "A bag of Yego Gatare Anaerobic Process on a reflective counter",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/light-with-kraft.jpg",
      alt: "Yego Gatare Anaerobic Process in its gorilla bag, a kraft bag behind",
      width: 2400,
      height: 2050,
    },
    {
      src: "/brand/products/light-with-kraft-wide.jpg",
      alt: "Yego Gatare Anaerobic Process bag in front of a kraft Yego bag",
      ...LANDSCAPE,
    },
  ],
  bulk: [
    {
      src: "/brand/products/bulk-plant.jpg",
      alt: "The Yego 5 lb kraft bag standing beside a leafy plant",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/bulk-label.jpg",
      alt: "The Yego 5 lb kraft bag, printed From Our Farms To Your Cup",
      width: 1628,
      height: 2400,
    },
    {
      src: "/brand/products/bulk-pair.jpg",
      alt: "Two Yego 5 lb kraft bags beside a plant",
      ...PORTRAIT,
    },
    {
      src: "/brand/products/bulk-pair-reflection.jpg",
      alt: "Two Yego 5 lb kraft bags reflected on a dark counter",
      ...PORTRAIT,
    },
  ],
};
