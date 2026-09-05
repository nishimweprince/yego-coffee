/**
 * The store's own collections are the catalogue's structure (§96.4).
 *
 * Yego's Shopify collections separate the catalogue cleanly:
 *
 *   roasted-coffee  the four real coffees
 *   merch           the mug
 *   subscriptions   the eight duplicate subscription products (§92.1)
 *
 * Scoping the shop this way rather than by a hardcoded list of handles
 * means the store owners can add a coffee in Shopify and have it appear
 * here, and it keeps the duplicate subscription products — which are
 * the same coffees at a subscription price — out of a listing where
 * they would read as eight extra products.
 *
 * When §92.1's consolidation happens, the `subscriptions` collection
 * empties out and nothing here needs to change.
 */

export const COLLECTION_HANDLES = {
  coffee: "roasted-coffee",
  merch: "merch",
  /** Excluded from shop listings — see §92.1. */
  subscriptions: "subscriptions",
} as const;

export type ShopSection = {
  /** URL segment under /shop. */
  slug: string;
  label: string;
  collectionHandle: string;
};

export const SHOP_SECTIONS: ShopSection[] = [
  {
    slug: "coffee",
    label: "Coffee",
    collectionHandle: COLLECTION_HANDLES.coffee,
  },
  { slug: "merch", label: "Merch", collectionHandle: COLLECTION_HANDLES.merch },
];
