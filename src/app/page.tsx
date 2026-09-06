import { CafeBlock } from "@/components/home/cafe-block";
import { CoffeeFinder } from "@/components/home/coffee-finder";
import { DiscoveryCards } from "@/components/home/discovery-cards";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HomeAbout } from "@/components/home/home-about";
import { SignatureCoffees } from "@/components/home/signature-coffees";
import { SubscriptionBlock } from "@/components/home/subscription-block";
import { HOME } from "@/content/home";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { featuredPlans, summarisePlans } from "@/lib/catalog/plans";
import { getReassurances } from "@/lib/content/reassurance";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

/**
 * The homepage — Hero, About, Discovery, showcase, finder, café,
 * subscriptions, closing call to action, in that order.
 *
 * The page descends through surface bands rather than sitting on one
 * flat field: chalk for the opening movement, soil for Discovery,
 * chalk again for the lineup, wash for the finder, soil for the café,
 * and ochre once — at the subscription band, where the visitor is
 * asked to commit.
 *
 * Everything commercial on this page is read from Shopify at render
 * time: no price, title or availability is duplicated into content.
 * The two reassurances are excerpts of the store's own policy
 * documents, so shipping cost and cancellation terms reach a visitor
 * beside the buttons rather than only on /policies.
 */
export default async function HomePage() {
  if (!hasShopifyCredentials()) {
    // The brand story stands on its own without the catalogue; only the
    // commerce sections need Shopify.
    return (
      <main data-hero="video">
        <Hero />
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

  // The signature section features the coffees, not the 5 lb Bag: that
  // is a format of the same three roasts, and repeating them reads as
  // a longer catalogue than Yego has.
  const signature = (coffee?.products ?? []).filter((p) =>
    Object.hasOwn(HOME.signature.descriptors, p.handle),
  );

  // Cadence lives on the variant's allocation, which only the detail
  // query fetches — so the subscription products are read in full.
  const planProducts = await Promise.all(
    (subscriptions?.products ?? []).map((p) => getProduct(p.handle)),
  );
  const plans = featuredPlans(
    summarisePlans(
      planProducts.filter((p): p is NonNullable<typeof p> => p !== null),
    ),
    HOME.subscription.featuredHandles,
  );

  return (
    <main data-hero="video">
      <Hero />

      <HomeAbout />

      <DiscoveryCards products={signature} />

      <SignatureCoffees products={signature} />

      <CoffeeFinder />

      <CafeBlock />

      <SubscriptionBlock
        plans={plans}
        cancellation={reassurances.cancellation}
      />

      <FinalCta shipping={reassurances.shipping} />
    </main>
  );
}
