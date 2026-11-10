import { PRODUCT_PHOTOS, type CoffeeKey } from "@/content/product-photos";
import type { BrandImage } from "@/content/images";
import type {
  CartLineModel,
  ProductCardModel,
  ProductDetailModel,
  ShopifyImage,
} from "@/lib/shopify/types";
import { regularCoffeeKey } from "./subscription-type";

/**
 * The owners' studio photographs lead each coffee's tile and gallery
 * (plan.md §111). Shopify's own photographs follow them.
 *
 * Applied once, in the Storefront read layer, so every surface — the
 * shelf, the product page, the subscription tiles, search, the cart —
 * shows the same picture of the same coffee. Prices, titles and
 * everything else stay Shopify's; this only changes which photograph
 * comes first.
 *
 * Roaster's Choice and the Drops are not mapped: the roasters choose
 * that coffee, so no single bag is the true picture of it, and they
 * keep §110's photographs.
 */

const BY_HANDLE: Record<string, CoffeeKey> = {
  "medium-roast": "medium",
  "dark-roast": "dark",
  "light-roast": "light",
  "5-lb-bag": "bulk",
};

/** The coffee a product handle shows, including its subscription siblings. */
export function coffeeKeyOf(handle: string): CoffeeKey | null {
  return BY_HANDLE[regularCoffeeKey(handle)] ?? null;
}

/**
 * The coffee an order or subscription line names. The Customer Account
 * API returns a line's title, not its product handle, so this reads the
 * store's own product titles — "Dark Roast - Monthly Subscription",
 * "Gatare Anaerobic Process.", "5 lb Bag".
 */
export function coffeeKeyOfTitle(title: string): CoffeeKey | null {
  const t = title.toLowerCase();
  if (t.includes("roaster") || t.includes("drop")) return null;
  if (t.includes("5 lb")) return "bulk";
  if (t.includes("gatare") || t.includes("light roast")) return "light";
  if (t.includes("medium roast")) return "medium";
  if (t.includes("dark roast")) return "dark";
  return null;
}

function toShopifyImage(photo: BrandImage): ShopifyImage {
  return {
    url: photo.src,
    altText: photo.alt,
    width: photo.width,
    height: photo.height,
  };
}

/** The lead photograph for a coffee, or null. */
export function brandPhotoFor(key: CoffeeKey | null): ShopifyImage | null {
  const lead = key ? PRODUCT_PHOTOS[key][0] : undefined;
  return lead ? toShopifyImage(lead) : null;
}

/**
 * Shopify's photographs for these products are the owners' phone
 * shots, uploaded as HEIC and shared between products — Medium and
 * Dark show the very same three frames. Once the studio set leads,
 * those are duplicates of no value, so they are dropped. Anything
 * else Shopify holds (a JPEG the owners add later) still follows.
 */
const HEIC = /\.heic(\?|$)/i;

function isDetail(
  product: ProductCardModel | ProductDetailModel,
): product is ProductDetailModel {
  return Array.isArray((product as ProductDetailModel).media);
}

export function withBrandPhotos<T extends ProductCardModel>(product: T): T {
  const key = coffeeKeyOf(product.handle);
  if (!key) return product;

  const photos = PRODUCT_PHOTOS[key].map(toShopifyImage);
  const withLead = { ...product, featuredImage: photos[0] ?? product.featuredImage };

  if (!isDetail(withLead)) return withLead;

  const shopify = withLead.media.filter((m) => !HEIC.test(m.url));
  return { ...withLead, media: [...photos, ...shopify] } as T;
}

export function withBrandPhotosAll<T extends ProductCardModel>(products: T[]): T[] {
  return products.map(withBrandPhotos);
}

/** A cart line shows the same photograph as the product's tile. */
export function withCartLinePhoto(line: CartLineModel): CartLineModel {
  const photo = brandPhotoFor(coffeeKeyOf(line.productHandle));
  return photo ? { ...line, image: photo } : line;
}

/**
 * The photograph for an order or subscription line, which the
 * Customer Account API identifies only by title. The store's own
 * photograph wins, as on the shelf; otherwise Shopify's, unless it is
 * a HEIC a browser cannot show.
 */
export function photoForLine(
  title: string,
  image: ShopifyImage | null,
): ShopifyImage | null {
  return (
    brandPhotoFor(coffeeKeyOfTitle(title)) ??
    (image && !HEIC.test(image.url) ? image : null)
  );
}
