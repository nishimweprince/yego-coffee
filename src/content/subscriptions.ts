import { IMAGES, type BrandImage } from "@/content/images";

/**
 * The photographs on the subscription surfaces (§110).
 *
 * Roaster's Choice is a coffee the roasters choose, so its pictures are
 * the selection itself: bags from past deliveries, one photograph per
 * box showing as many bags as that box holds. They illustrate the
 * shelf; each product's own Shopify photographs stay on its page.
 *
 * Regular subscriptions are the store's own coffees, so they keep the
 * Shopify product photographs everywhere.
 */
export const SUBSCRIPTION_PHOTOS = {
  /** Keyed by bags per delivery. A box without a photograph here keeps
   * the drawn bags. */
  roastersChoiceBoxes: {
    1: IMAGES.bagSingle,
    2: IMAGES.bagsPair,
    3: IMAGES.bagsTrio,
    4: IMAGES.bagsOnBurlap,
  } as Record<number, BrandImage | undefined>,
  /** The Roaster's Choice card on the chooser: the range it draws from. */
  roastersChoiceChooser: IMAGES.bagsLineup,
  /** Beside "how a box works": the coffee going into the bag. */
  roastersChoiceSteps: IMAGES.bagScoop,
};
