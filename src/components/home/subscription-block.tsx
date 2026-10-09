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
        {/* Photograph beside the offer, the same split the about and
            café sections use. On a phone it follows the plans, so the
            prices are not pushed below a picture. */}
        <div className="grid items-center gap-stack-lg lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Image
            {...IMAGES.bagsTrio}
            alt={IMAGES.bagsTrio.alt}
            sizes="(min-width: 1024px) 40vw, 100vw"
            loading="lazy"
            className="order-2 aspect-[4/3] w-full rounded-sm object-cover lg:order-1 lg:aspect-[4/5]"
          />

          <div className="order-1 lg:order-2">
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

            <div className="mt-stack-lg">
              <PlanList plans={plans} />
            </div>

            <Link
              href={HOME.subscription.cta.href}
              className={`${buttonVariants({ size: "lg" })} mt-stack-lg`}
            >
              {HOME.subscription.cta.label}
            </Link>
          </div>
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
