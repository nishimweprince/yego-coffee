import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
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
    <section data-surface="soil" className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <p className="label text-accent">Subscriptions</p>
        <h2 className="mt-stack-md text-display-l max-w-[14ch]">
          {HOME.subscription.heading}
        </h2>

        <ul className="mt-section-sm flex flex-wrap gap-x-6 gap-y-stack-xs">
          {HOME.subscription.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-2 text-body-s text-muted-foreground"
            >
              <FontAwesomeIcon
                icon={faCheck}
                className="h-3 w-3 text-accent"
                aria-hidden
              />
              {benefit}
            </li>
          ))}
        </ul>

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
          <ul className="mt-section-md space-y-2">
            {plans.map((plan) => (
              <li
                key={plan.handle}
                className="rounded-md bg-surface-elevated transition-all duration-200 ease-(--ease-brand) hover:-translate-y-px"
              >
                <Link
                  href={`/products/${plan.handle}`}
                  className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-stack-xs px-stack-lg py-stack-md transition-colors hover:text-accent"
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
          className={`group ${buttonVariants({ size: "lg" })} mt-section-sm`}
        >
          {HOME.subscription.cta.label}
          <FontAwesomeIcon
            icon={faArrowRight}
            className="h-4 w-4 transition-transform duration-200 ease-(--ease-brand) group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
