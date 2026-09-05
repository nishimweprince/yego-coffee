import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PriceRange } from "@/components/commerce/product-price";
import { HOME } from "@/content/home";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";

/**
 * §90.07 — the subscription section.
 *
 * Plans and prices come from Shopify (§2.1, §8.7: "do not hardcode plan
 * availability"), and every cadence line is generated from the selling
 * plan's own delivery policy rather than its name — the store contains
 * a plan called "Weekly membership" that bills every 60 days (§96.3).
 *
 * §90.07's four named plans are the store's current duplicate
 * subscription products (§92.1). They are shown as they are, because
 * they are what a customer can actually buy today. Nothing here claims
 * a saving: every selling plan in the store adjusts price by 0%
 * (§96.5), and §2.1 forbids inventing the comparison.
 */
export function SubscriptionBlock({
  plans,
}: {
  plans: SubscriptionPlanSummary[];
}) {
  return (
    <section data-surface="soil" className="px-page-x py-section-lg">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-display-l max-w-[14ch]">
          {HOME.subscription.heading}
        </h2>

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

        {plans.length > 0 ? (
          <ul className="mt-section-md divide-y divide-border border-y border-border">
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
        ) : null}

        <Link
          href={HOME.subscription.cta.href}
          className={`${buttonVariants({ size: "lg" })} mt-section-sm`}
        >
          {HOME.subscription.cta.label} →
        </Link>
      </div>
    </section>
  );
}
