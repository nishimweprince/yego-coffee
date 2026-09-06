import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { buttonVariants } from "@/components/ui/button";
import { PriceRange } from "@/components/commerce/product-price";
import { HOME } from "@/content/home";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";

/**
 * The subscription section — clean ruled rows on Paper.
 *
 * Plans and prices come from Shopify, and every cadence line is
 * generated from the selling plan's own delivery policy rather than
 * its name. Nothing here claims a saving: every selling plan in the
 * store adjusts price by 0%, and inventing the comparison is
 * forbidden.
 */
export function SubscriptionBlock({
  plans,
}: {
  plans: SubscriptionPlanSummary[];
}) {
  return (
    <section
      aria-labelledby="subscription-heading"
      data-surface="wash"
      className="px-page-x py-section-md"
    >
      <div className="mx-auto max-w-6xl">
        <p className="label text-accent">Subscriptions</p>
        <h2
          id="subscription-heading"
          className="mt-stack-md max-w-[14ch] text-display-l"
        >
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
          <ul className="mt-section-md border-t border-rule">
            {plans.map((plan) => (
              <li key={plan.handle} className="border-b border-rule">
                <Link
                  href={`/products/${plan.handle}`}
                  className="group flex min-h-11 flex-wrap items-baseline justify-between gap-x-8 gap-y-stack-xs py-stack-md transition-colors hover:text-accent"
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
