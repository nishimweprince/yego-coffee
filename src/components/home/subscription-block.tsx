import Link from "next/link";
import { SubscriptionGrid } from "@/components/commerce/subscription-tile";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import type { Reassurance } from "@/lib/content/reassurance";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";

/**
 * The subscriptions shelf — the page's closing offer (§108, §109).
 *
 * The same row as the coffees above it: heading and link, then the shop
 * grid. The plans are SubscriptionGrid, shared with /subscriptions so
 * the two cannot drift, and every plan, price and cadence on it is
 * Shopify's. The cancellation terms below are the store's own.
 */
export function SubscriptionBlock({
  plans,
  cancellation,
}: {
  plans: SubscriptionPlanSummary[];
  cancellation: Reassurance | null;
}) {
  if (plans.length === 0) return null;

  return (
    <section
      aria-labelledby="subscription-heading"
      className="px-page-x py-section-sm"
    >
      <div className="mx-auto max-w-page">
        <div className="flex flex-wrap items-baseline justify-between gap-stack-md">
          <h2 id="subscription-heading" data-reveal className="text-h3">
            {HOME.subscription.heading}
          </h2>
          <Link
            href={HOME.subscription.cta.href}
            className="text-body-m font-bold text-accent underline underline-offset-4 hover:text-foreground"
          >
            {HOME.subscription.cta.label}
          </Link>
        </div>
        <p
          data-reveal
          className="mt-stack-sm max-w-[52ch] text-lede text-muted-foreground"
        >
          {HOME.subscription.lede}
        </p>

        <SubscriptionGrid plans={plans} className="mt-15" />

        <YegoLine reassurance={cancellation} className="mt-section-sm" />
      </div>
    </section>
  );
}
