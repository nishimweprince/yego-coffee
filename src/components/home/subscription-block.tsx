import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PlanList } from "@/components/commerce/plan-list";
import { YegoLine } from "@/components/ui/yego-line";
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
 * Plans and prices come from Shopify (see PlanList), and every cadence line is
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

          <PlanList plans={plans} />
        </div>

        {/* The cancellation terms, beside the plans rather than on a
            policy page — answered with the brand's own word, the way
            the shipping question is answered beside the prices. One
            Yego line per question a customer actually asks. */}
        <YegoLine reassurance={cancellation} className="mt-section-md" />
      </div>
    </section>
  );
}
