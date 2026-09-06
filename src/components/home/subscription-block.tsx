import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PriceRange } from "@/components/commerce/product-price";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import type { Reassurance } from "@/lib/content/reassurance";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";

/**
 * The subscription band — the page's one saturated surface.
 *
 * Ochre is used exactly once, here, where the visitor is asked to
 * commit. Everything on it is ink: forest on ochre measures 2.78:1.
 *
 * The plans come first and the mechanics second. Leading with
 * "01 Choose your roast" asked someone to read an instruction manual
 * before seeing what was on offer. The numbered steps stay — three
 * steps in a fixed order is a genuine sequence, so the numbering
 * encodes something true — but they sit below the plans now, set in
 * the utility face as data rather than as headings.
 *
 * Plans and prices come from Shopify, and every cadence line is
 * generated from the selling plan's own delivery policy rather than
 * its name. Nothing here claims a saving: every selling plan in the
 * store adjusts price by 0%, and inventing the comparison is
 * forbidden. The reason to subscribe is the schedule, and the
 * cancellation terms below are the store's own.
 */
export function SubscriptionBlock({
  plans,
  cancellation,
}: {
  plans: SubscriptionPlanSummary[];
  cancellation: Reassurance | null;
}) {
  return (
    <section
      aria-labelledby="subscription-heading"
      data-surface="ochre"
      className="px-page-x pt-section-lg pb-section-md"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="subscription-heading"
          className="type-display max-w-[14ch] text-display-l"
        >
          {HOME.subscription.heading}
        </h2>

        {plans.length > 0 ? (
          <ul className="mt-section-sm border-t border-rule">
            {plans.map((plan) => (
              <li key={plan.handle} className="border-b border-rule">
                <Link
                  href={`/products/${plan.handle}`}
                  className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-8 gap-y-stack-xs py-stack-md transition-opacity hover:opacity-70"
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
          {HOME.subscription.cta.label}
        </Link>

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

        <YegoLine reassurance={cancellation} className="mt-section-md" />
      </div>
    </section>
  );
}
