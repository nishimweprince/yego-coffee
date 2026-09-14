import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PriceRange } from "@/components/commerce/product-price";
import { HOME } from "@/content/home";
import type { Reassurance } from "@/lib/content/reassurance";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";

/**
 * The subscription section.
 *
 * The plans come first and the mechanics second. Leading with the
 * steps asked someone to read an instruction manual before seeing
 * what was on offer. The three steps stay numbered — a fixed order is
 * a genuine sequence — but as an ordinary ordered list, not as
 * zero-padded figures set like chapter heads.
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
      className="px-page-x py-section-md"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-stack-lg lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <h2
              id="subscription-heading"
              className="max-w-[14ch] text-display-l"
            >
              {HOME.subscription.heading}
            </h2>

            <ol className="mt-stack-lg max-w-prose list-decimal space-y-stack-xs pl-5 text-body-m text-muted-foreground marker:text-muted-foreground">
              {HOME.subscription.steps.map((step) => (
                <li key={step} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>

            <Link
              href={HOME.subscription.cta.href}
              className={`${buttonVariants({ size: "lg" })} mt-stack-lg`}
            >
              {HOME.subscription.cta.label}
            </Link>
          </div>

          {plans.length > 0 ? (
            <ul className="border-t border-border">
              {plans.map((plan) => (
                <li key={plan.handle} className="border-b border-border">
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
          ) : null}
        </div>

        {/* The cancellation terms, beside the plans rather than on a
            policy page. Not a Yego line: the page's one is with the
            prices above, and stacking two spends the device twice. */}
        {cancellation ? (
          <div className="mt-section-md max-w-prose border-t border-border pt-stack-md">
            <p className="label text-muted-foreground">{cancellation.question}</p>
            <p className="mt-stack-xs text-body-m text-muted-foreground">
              {cancellation.html}{" "}
              <Link
                href={cancellation.href}
                className="text-foreground underline underline-offset-4"
              >
                Read the full policy
                <span className="sr-only"> — {cancellation.title}</span>
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
