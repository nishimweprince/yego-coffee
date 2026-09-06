import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { PriceRange } from "@/components/commerce/product-price";
import { HOME } from "@/content/home";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { featuredPlans, summarisePlans } from "@/lib/catalog/plans";
import { hasShopifyCredentials } from "@/lib/env";
import { splitPolicySections } from "@/lib/shopify/policies";
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
          <p className="label text-accent">Subscriptions</p>
          <h1 className="mt-stack-md max-w-[14ch] text-display-l">
            {HOME.subscription.heading}
          </h1>
          <ul className="mt-stack-lg flex max-w-prose flex-wrap gap-x-6 gap-y-stack-xs">
            {HOME.subscription.benefits.map((benefit) => (
              <li key={benefit} className="text-body-s text-muted-foreground">
                {benefit}
              </li>
            ))}
          </ul>
          <ol className="mt-section-sm grid gap-stack-lg sm:grid-cols-3">
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

      <section className="px-page-x py-section-sm">
        <div className="mx-auto max-w-5xl">
          <p className="label text-accent">Plans</p>
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

          <p className="label text-accent mt-section-md">What you get</p>
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
                aria-label="Cancellation"
                className="mt-section-md border-t border-rule pt-stack-lg"
              >
                <p className="label text-accent">Cancellation</p>
                <h2 className="mt-stack-md max-w-[20ch] text-h1">
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
                <p className="label text-accent mt-section-md">
                  {cancellation.title}
                </p>
                <div
                  className="mt-section-sm max-w-prose space-y-stack-md text-body-m text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: cancellation.bodyHtml }}
                />
              </>
            )
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
