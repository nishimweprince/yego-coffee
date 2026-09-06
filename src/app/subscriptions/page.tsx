import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { PriceRange } from "@/components/commerce/product-price";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { featuredPlans, summarisePlans } from "@/lib/catalog/plans";
import { getReassurances } from "@/lib/content/reassurance";
import { hasShopifyCredentials } from "@/lib/env";
import { splitPolicySections } from "@/lib/shopify/policies";
import { getCollection, getPolicies, getProduct } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Coffee on your schedule, roasted in Somerville.",
};

/**
 * Subscriptions.
 *
 * The plans lead and the mechanics follow: someone arriving here has
 * already decided to consider a subscription and wants to know what is
 * on offer, not how the process works.
 *
 * §10.5 lists four benefits including "Save on every delivery". That
 * one is not shown: every selling plan in this store adjusts price by
 * 0% (§96.5), and §10.5 itself requires the wording to reflect actual
 * Shopify capabilities and store policies. The others are true.
 *
 * The cancellation terms are Shopify's own subscription policy,
 * excerpted and linked rather than paraphrased — a paraphrase of a
 * cancellation policy is a second, unmaintained version of a document
 * customers rely on. The compact answer at the top comes from the same
 * document via the shared reassurance helper, so the two can never
 * drift apart.
 */
export default async function SubscriptionsPage() {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const [subscriptions, policies, reassurances] = await Promise.all([
    getCollection(COLLECTION_HANDLES.subscriptions),
    getPolicies(),
    getReassurances(),
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

  // The cancellation document covers subscriptions, pre-orders and
  // try-before-you-buy; only the first applies to anything Yego sells.
  // Excerpt the intro plus the Subscriptions section verbatim and link
  // the full document. If the store ever rewrites the doc so the
  // section is unrecognisable, fall back to the whole body rather than
  // an empty reassurance.
  const cancellationSections = cancellation
    ? splitPolicySections(cancellation.bodyHtml)
    : [];
  const cancellationExcerpt = cancellationSections.filter(
    (section) =>
      section.heading === null ||
      /^(cancellation policy|subscriptions)$/i.test(section.heading),
  );
  const cancellationComplete =
    cancellationExcerpt.length > 0 &&
    cancellationExcerpt.some((section) =>
      /^(subscriptions)$/i.test(section.heading ?? ""),
    );

  return (
    <main>
      <section className="px-page-x py-section-md">
        <div className="mx-auto max-w-5xl">
          <h1 className="type-display max-w-[14ch] text-display-l">
            {HOME.subscription.heading}
          </h1>
          <ul className="mt-stack-lg flex max-w-prose flex-wrap gap-x-6 gap-y-stack-xs">
            {HOME.subscription.benefits.map((benefit) => (
              <li key={benefit} className="label text-muted-foreground">
                {benefit}
              </li>
            ))}
          </ul>

          <YegoLine
            reassurance={reassurances.cancellation}
            className="mt-section-sm"
          />
        </div>
      </section>

      <section
        aria-labelledby="plans-heading"
        data-surface="wash"
        className="px-page-x py-section-md"
      >
        <div className="mx-auto max-w-5xl">
          <h2 id="plans-heading" className="type-display text-display-l">
            Plans
          </h2>
          <ul className="mt-section-sm border-t border-rule">
            {plans.map((plan) => (
              <li key={plan.handle} className="border-b border-rule">
                <Link
                  href={`/products/${plan.handle}`}
                  className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-8 gap-y-stack-xs py-stack-md transition-colors hover:text-accent"
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

          <ol className="mt-section-md grid gap-stack-lg sm:grid-cols-3">
            {HOME.subscription.steps.map((step, index) => (
              <li key={step} className="flex items-baseline gap-3">
                <span className="type-figure text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-body-m">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-page-x py-section-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="type-display text-display-l">What you get</h2>
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
            cancellationComplete ? (
              <section
                aria-labelledby="cancellation-heading"
                className="mt-section-md border-t border-rule pt-stack-lg"
              >
                <h2
                  id="cancellation-heading"
                  className="max-w-[20ch] text-h1"
                >
                  Cancel or change at any time.
                </h2>
                {cancellationExcerpt.map((section) => (
                  <div
                    key={section.heading ?? "intro"}
                    className="mt-stack-md max-w-prose space-y-stack-md text-body-m text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                ))}
                <Link
                  href={`/policies/${cancellation.handle}`}
                  className="link-sweep mt-stack-lg inline-block label text-accent"
                >
                  Read the full cancellation policy
                </Link>
              </section>
            ) : (
              <>
                <h2 className="mt-section-md text-h1">{cancellation.title}</h2>
                <div
                  className="mt-section-sm max-w-prose space-y-stack-md text-body-m text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: cancellation.bodyHtml }}
                />
              </>
            )
          ) : null}

          <div className="mt-section-md">
            <Link href="/quiz" className={buttonVariants({ size: "lg" })}>
              Find my coffee
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
