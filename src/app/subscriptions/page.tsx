import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { PriceRange } from "@/components/commerce/product-price";
import { HOME } from "@/content/home";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { featuredPlans, summarisePlans } from "@/lib/catalog/plans";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getPolicies, getProduct } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Coffee on your schedule, roasted in Somerville.",
};

/**
 * Subscriptions (plan.md §6, §10.5's benefit block, §75 Phase 7's FAQ).
 *
 * §10.5 lists four benefits including "Save on every delivery". That
 * one is not shown: every selling plan in this store adjusts price by
 * 0% (§96.5), and §10.5 itself requires the wording to reflect actual
 * Shopify capabilities and store policies. The others are true.
 *
 * The cancellation terms are Shopify's own subscription policy,
 * excerpted and linked rather than paraphrased — a paraphrase of a
 * cancellation policy is a second, unmaintained version of a document
 * customers rely on.
 */
export default async function SubscriptionsPage() {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const [subscriptions, policies] = await Promise.all([
    getCollection(COLLECTION_HANDLES.subscriptions),
    getPolicies(),
  ]);

  const planProducts = await Promise.all(
    (subscriptions?.products ?? []).map((p) => getProduct(p.handle)),
  );
  const plans = featuredPlans(
    summarisePlans(planProducts.filter((p) => p !== null)),
    HOME.subscription.featuredHandles,
  );

  const cancellation = policies.find((p) => /cancellation|subscription/i.test(p.title));
  const shipping = policies.find((p) => /shipping/i.test(p.title));

  return (
    <main>
      <section data-surface="soil" className="px-page-x py-section-lg">
        <div className="mx-auto max-w-5xl">
          <h1 className="max-w-[14ch] text-display-l">
            {HOME.subscription.heading}
          </h1>
          <ol className="mt-section-md grid gap-stack-lg sm:grid-cols-3">
            {HOME.subscription.steps.map((step, index) => (
              <li key={step}>
                <span className="label text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-stack-sm text-body-l">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-page-x py-section-md">
        <div className="mx-auto max-w-5xl">
          <Contour label="Plans" />
          <ul className="mt-section-sm divide-y divide-border border-y border-border">
            {plans.map((plan) => (
              <li key={plan.handle}>
                <Link
                  href={`/products/${plan.handle}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-stack-xs py-stack-md transition-colors hover:text-accent"
                >
                  <span className="text-body-l">{plan.title}</span>
                  <span className="flex items-baseline gap-6">
                    {plan.cadences.length > 0 ? (
                      <span className="label text-muted-foreground">
                        {plan.cadences.join(" · ")}
                      </span>
                    ) : null}
                    <PriceRange min={plan.minPrice} max={plan.maxPrice} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Contour label="What you get" className="mt-section-md" />
          <ul className="mt-section-sm max-w-prose space-y-stack-md text-body-l">
            <li>Freshly roasted coffee on your schedule.</li>
            <li>Skip, change or cancel according to the terms below.</li>
            {shipping ? (
              <li
                className="[&_a]:underline"
                dangerouslySetInnerHTML={{ __html: shipping.bodyHtml }}
              />
            ) : null}
          </ul>

          {cancellation ? (
            <>
              <Contour label={cancellation.title} className="mt-section-md" />
              <div
                className="mt-section-sm max-w-prose space-y-stack-md text-body-m text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: cancellation.bodyHtml }}
              />
            </>
          ) : null}

          <div className="mt-section-md">
            <Link href="/quiz" className={buttonVariants({ size: "lg" })}>
              Find My Coffee
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
