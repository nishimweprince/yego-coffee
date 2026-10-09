import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { PriceRange } from "@/components/commerce/product-price";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";
import { cn } from "@/lib/utils";

/**
 * The subscription plans, as a list of rows that read as links.
 *
 * A ruled list of names and prices looked like a price table — the
 * one thing on the page you are not meant to click. Each row now
 * carries an arrow, fills with linen on hover and turns its title
 * roast, and the fill bleeds past the text edge so it reads as a
 * control rather than a highlighted line. Keyboard focus gets the
 * same fill, so the affordance is not hover-only.
 *
 * Shared by the homepage and /subscriptions so the two lists cannot
 * drift. Plans, cadences and prices are Shopify's (§2.1).
 */
export function PlanList({
  plans,
  className,
}: {
  plans: SubscriptionPlanSummary[];
  className?: string;
}) {
  if (plans.length === 0) return null;

  return (
    <ul className={cn("border-t border-border", className)}>
      {plans.map((plan) => (
        <li key={plan.handle} className="border-b border-border">
          <Link
            href={`/products/${plan.handle}`}
            className="group -mx-stack-sm flex min-h-14 items-center gap-4 rounded-sm px-stack-sm py-stack-md transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-8 gap-y-stack-xs">
              <span className="text-body-l font-medium transition-colors group-hover:text-accent group-focus-visible:text-accent">
                {plan.title}
              </span>
              <span className="flex w-full items-baseline justify-between gap-6 sm:w-auto">
                {plan.cadences.length > 0 ? (
                  <span className="label text-muted-foreground">
                    {plan.cadences.join(", ")}
                  </span>
                ) : null}
                <PriceRange min={plan.minPrice} max={plan.maxPrice} />
              </span>
            </span>
            <FontAwesomeIcon
              icon={faArrowRight}
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-[transform,color] duration-200 ease-(--ease-brand) group-hover:translate-x-1 group-hover:text-accent group-focus-visible:translate-x-1 group-focus-visible:text-accent"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
