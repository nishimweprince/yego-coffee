import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PlanList } from "@/components/commerce/plan-list";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import { IMAGES } from "@/content/images";
import type { Reassurance } from "@/lib/content/reassurance";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";

/**
 * The subscriptions banner — the page's closing offer (§108).
 *
 * On the page's own ground like every other row (§108.4): the offer
 * is told apart by its heading and plans, not by a tinted band.
 *
 * Plans and prices come from Shopify (see PlanList), and every cadence
 * line is generated from the selling plan's own delivery policy rather
 * than its name. Nothing here claims a saving: every selling plan in
 * the store adjusts price by 0%, and inventing the comparison is
 * forbidden. The cancellation terms below are the store's own.
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
      className="px-page-x py-section-sm"
    >
      <div className="mx-auto max-w-page">
        <div className="grid items-center gap-stack-lg md:grid-cols-2 md:gap-12 lg:gap-16">
          <div data-reveal>
            <h2 id="subscription-heading" className="max-w-[16ch] text-h2">
              {HOME.subscription.heading}
            </h2>
            <p className="mt-stack-md max-w-[40ch] text-lede text-muted-foreground">
              {HOME.subscription.lede}
            </p>

            <PlanList plans={plans} className="mt-stack-lg" />

            <Link
              href={HOME.subscription.cta.href}
              className={buttonVariants({ size: "lg", className: "mt-stack-lg" })}
            >
              {HOME.subscription.cta.label}
            </Link>
          </div>

          {/* After the plans on a phone, so the prices are not pushed
              below a picture. */}
          <Image
            {...IMAGES.bagsTrio}
            alt={IMAGES.bagsTrio.alt}
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="lazy"
            data-reveal
            style={{ "--reveal-order": 1 } as React.CSSProperties}
            className="aspect-[4/3] w-full rounded-card object-cover"
          />
        </div>

        {/* The cancellation terms, beside the plans rather than on a
            policy page — one Yego line per question a customer asks. */}
        <YegoLine reassurance={cancellation} className="mt-section-sm" />
      </div>
    </section>
  );
}
