import { BrandStatement } from "@/components/home/brand-statement";
import { CafeBlock } from "@/components/home/cafe-block";
import { CoffeeFinder } from "@/components/home/coffee-finder";
import { DiscoveryCards } from "@/components/home/discovery-cards";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { SignatureCoffees } from "@/components/home/signature-coffees";
import { SubscriptionBlock } from "@/components/home/subscription-block";
import { HOME } from "@/content/home";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { featuredPlans, summarisePlans } from "@/lib/catalog/plans";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

/**
 * The homepage — §90's script, in order.
 *
 * §90.08 (social proof) and §90.09 (journal) are absent. §90.08 requires
 * verifiable sources and §71 forbids inventing testimonials; §90.09's
 * three entries are unwritten and the journal is Phase 7. Both are
 * omitted rather than stubbed: an empty testimonial rail says the brand
 * has no customers, and a "Read more" that leads nowhere is worse than
 * a shorter page.
 *
 * Everything commercial on this page is read from Shopify at render
 * time (§57): no price, title or availability is duplicated into
 * content.
 */
export default async function HomePage() {
  if (!hasShopifyCredentials()) {
    // The brand story stands on its own without the catalogue; only the
    // commerce sections need Shopify.
    return (
      <main>
        <Hero />
        <BrandStatement />
        <CafeBlock />
      </main>
    );
  }

  const [coffee, subscriptions] = await Promise.all([
    getCollection(COLLECTION_HANDLES.coffee),
    getCollection(COLLECTION_HANDLES.subscriptions),
  ]);

  // §90.03 features the coffees, not the 5 lb Bag: that is a format of
  // the same three roasts, and repeating them reads as a longer
  // catalogue than Yego has (§93.5).
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

      <section className="px-page-x py-section-sm">
        <div className="mx-auto max-w-6xl">
          <p className="label text-accent">Discovery</p>
          <h2 className="mt-stack-md max-w-[18ch] text-display-l">
            {HOME.discovery.heading}
          </h2>
          <div className="mt-section-sm">
            <DiscoveryCards products={signature} />
          </div>
        </div>
      </section>

      <SignatureCoffees products={signature} />

      <BrandStatement />

      <CoffeeFinder />

      <CafeBlock />

      <SubscriptionBlock plans={plans} />

      <FinalCta />
    </main>
  );
}
