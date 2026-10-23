import { CafeBlock } from "@/components/home/cafe-block";
import { Hero } from "@/components/home/hero";
import { HomeAbout } from "@/components/home/home-about";
import { HomeLineup } from "@/components/home/home-lineup";
import { HomeStatement } from "@/components/home/home-statement";
import { SubscriptionBlock } from "@/components/home/subscription-block";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { summarisePlans } from "@/lib/catalog/plans";
import { getReassurances } from "@/lib/content/reassurance";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

/**
 * The homepage — Hero, statement, the coffees, about, the café,
 * subscriptions, in that order (§108).
 *
 * A full screen of photographs, then a shop's rhythm on a near-white
 * ground: one centred line, the shelf, two mirrored feature rows and
 * the recurring offer. Sections are told apart by whitespace and,
 * once, the contour rule.
 *
 * Everything commercial on this page is read from Shopify at render
 * time: no price, title or availability is duplicated into content.
 * The two reassurances are excerpts of the store's own policy
 * documents, so shipping cost and cancellation terms reach a visitor
 * beside the prices and the plans rather than only on /policies.
 */
export default async function HomePage() {
  if (!hasShopifyCredentials()) {
    // The brand story stands on its own without the catalogue; only the
    // commerce sections need Shopify.
    return (
      <main data-hero="slides">
        <Hero />
        <HomeStatement />
        <HomeAbout />
        <CafeBlock />
      </main>
    );
  }

  const [coffee, subscriptions, reassurances] = await Promise.all([
    getCollection(COLLECTION_HANDLES.coffee),
    getCollection(COLLECTION_HANDLES.subscriptions),
    getReassurances(),
  ]);

  // Cadence lives on the variant's allocation, which only the detail
  // query fetches — so the subscription products are read in full.
  const planProducts = await Promise.all(
    (subscriptions?.products ?? []).map((p) => getProduct(p.handle)),
  );
  const plans = summarisePlans(
    planProducts.filter((p): p is NonNullable<typeof p> => p !== null),
  );

  return (
    <main data-hero="slides">
      <Hero />

      <HomeStatement />

      <HomeLineup
        products={coffee?.products ?? []}
        shipping={reassurances.shipping}
      />

      <HomeAbout />

      <CafeBlock />

      <SubscriptionBlock
        plans={plans}
        cancellation={reassurances.cancellation}
      />
    </main>
  );
}
