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
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

/**
 * The homepage — Hero, About, Discovery, showcase, finder, café,
 * subscriptions, closing call to action, in that order.
 *
 * The founder story sits directly after the hero: photograph, two
 * concise paragraphs of confirmed fact, and a link to the full story.
 * The numbered principle grid stays off this page; verified facts
 * travel in the compact Rwanda-to-Somerville rail instead.
 *
 * Everything commercial on this page is read from Shopify at render
 * time: no price, title or availability is duplicated into content.
 */
export default async function HomePage() {
  if (!hasShopifyCredentials()) {
    // The brand story stands on its own without the catalogue; only the
    // commerce sections need Shopify.
    return (
      <main>
        <Hero />
        <HomeAbout />
        <CafeBlock />
      </main>
    );
  }

  const [coffee, subscriptions] = await Promise.all([
    getCollection(COLLECTION_HANDLES.coffee),
    getCollection(COLLECTION_HANDLES.subscriptions),
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
    <main>
      <Hero />

      <HomeAbout />

      <section aria-labelledby="discovery-heading" className="px-page-x py-section-sm">
        <div className="mx-auto max-w-6xl">
          <p className="label text-accent">Discovery</p>
          <h2
            id="discovery-heading"
            className="mt-stack-md max-w-[18ch] text-display-l"
          >
            {HOME.discovery.heading}
          </h2>
          <div className="mt-section-sm">
            <DiscoveryCards products={signature} />
          </div>
        </div>
      </section>

      <SignatureCoffees products={signature} />

      <CoffeeFinder />

      <CafeBlock />

      <SubscriptionBlock plans={plans} />

      <FinalCta />
    </main>
  );
}
