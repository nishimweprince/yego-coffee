import Link from "next/link";
import { SubscriptionChooser } from "@/components/commerce/subscription-chooser";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import type { Reassurance } from "@/lib/content/reassurance";
import type { SubscriptionShelves } from "@/lib/catalog/shelves";

/**
 * The subscriptions offer — the page's closing section (§108, §110).
 *
 * Heading and link, then the same two-card chooser /subscriptions
 * opens with, so a visitor makes the one decision that matters here —
 * a coffee they choose, or one the roasters choose — and lands on that
 * shelf. Every plan, price and cadence on it is Shopify's. The
 * cancellation terms below are the store's own.
 */
export function SubscriptionBlock({
  shelves,
  cancellation,
}: {
  shelves: SubscriptionShelves;
  cancellation: Reassurance | null;
}) {
  if (shelves.regular.length + shelves.roastersChoice.length === 0) {
    return null;
  }

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

        <SubscriptionChooser
          hrefBase="/subscriptions"
          className="mt-15"
          options={[
            {
              type: "regular",
              text: shelves.typeText.regular,
              plans: shelves.regular,
            },
            {
              type: "roasters-choice",
              text: shelves.typeText["roasters-choice"],
              plans: shelves.roastersChoice,
            },
          ]}
        />

        <YegoLine reassurance={cancellation} className="mt-section-sm" />
      </div>
    </section>
  );
}
