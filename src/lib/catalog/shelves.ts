import "server-only";

import { COLLECTION_HANDLES } from "./collections";
import { groupPlans, summarisePlans, type SubscriptionPlanSummary } from "./plans";
import {
  getSubscriptionType,
  splitSubscriptionType,
  type SubscriptionType,
} from "./subscription-type";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

export type SubscriptionShelves = {
  roastersChoice: SubscriptionPlanSummary[];
  regular: SubscriptionPlanSummary[];
  /** Each type's description, in the owners' words; null when unwritten. */
  typeText: Record<SubscriptionType, string | null>;
};

/**
 * The subscriptions collection, read in full and split into its two
 * shelves (§110). Shared by the homepage and /subscriptions so the
 * chooser on one cannot disagree with the other.
 *
 * Cadence lives on the variant's allocation, which only the detail
 * query fetches — so every subscription product is read in full.
 */
export async function getSubscriptionShelves(): Promise<SubscriptionShelves> {
  const collection = await getCollection(COLLECTION_HANDLES.subscriptions);
  const products = (
    await Promise.all(
      (collection?.products ?? []).map((p) => getProduct(p.handle)),
    )
  ).filter((p) => p !== null);

  const typeText: Record<SubscriptionType, string | null> = {
    regular: null,
    "roasters-choice": null,
  };
  for (const product of products) {
    const type = getSubscriptionType(product);
    if (!type || typeText[type]) continue;
    typeText[type] = splitSubscriptionType(product.descriptionHtml).text;
  }

  return { ...groupPlans(summarisePlans(products)), typeText };
}
