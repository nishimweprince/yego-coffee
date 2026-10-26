import type { Metadata } from "next";
import Image from "next/image";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { SubscriptionChooser } from "@/components/commerce/subscription-chooser";
import { SubscriptionGrid } from "@/components/commerce/subscription-tile";
import { Contour } from "@/components/ui/contour";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import { SUBSCRIPTION_PHOTOS } from "@/content/subscriptions";
import { getSubscriptionShelves } from "@/lib/catalog/shelves";
import type { SubscriptionPlanSummary } from "@/lib/catalog/plans";
import {
  SUBSCRIPTION_TYPE_ANCHORS,
  SUBSCRIPTION_TYPE_LABELS,
  type SubscriptionType,
} from "@/lib/catalog/subscription-type";
import { getReassurances } from "@/lib/content/reassurance";
import { hasShopifyCredentials } from "@/lib/env";

export const metadata: Metadata = {
  title: "Subscriptions",
  description:
    "Coffee by subscription: choose your coffee, or let our roasters choose. Roasted in Somerville and delivered on your schedule.",
};

/** One shelf: its contour, heading and tiles. */
function Shelf({
  type,
  heading,
  plans,
  children,
}: {
  type: SubscriptionType;
  heading: string;
  plans: SubscriptionPlanSummary[];
  children?: React.ReactNode;
}) {
  if (plans.length === 0) return null;
  const id = SUBSCRIPTION_TYPE_ANCHORS[type];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="mt-section-md scroll-mt-30"
    >
      <Contour label={SUBSCRIPTION_TYPE_LABELS[type]} />
      <h2 id={`${id}-heading`} data-reveal className="mt-stack-lg text-h3">
        {heading}
      </h2>
      <SubscriptionGrid plans={plans} className="mt-15" />
      {children}
    </section>
  );
}

/**
 * Subscriptions (§110).
 *
 * Yego sells two kinds, and the page opens by asking which: a coffee
 * you choose, or one the roasters choose. Each card links down to its
 * own shelf. The two shelves follow, each under a contour naming it —
 * the page's two contours, both carrying the real section name.
 *
 * Everything on the cards and the shelves is Shopify's: the owners'
 * description of each type, the plans, their prices and cadences. The
 * two questions that stop a subscription — shipping and cancellation —
 * are each answered once at the foot, with the store's own policy.
 */
export default async function SubscriptionsPage() {
  if (!hasShopifyCredentials()) {
    return (
      <Section as="div">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </Section>
    );
  }

  const [shelves, reassurances] = await Promise.all([
    getSubscriptionShelves(),
    getReassurances(),
  ]);

  return (
    <main>
      <Section>
        <PageHeader
          align="center"
          title={HOME.subscription.heading}
          lede={HOME.subscription.lede}
        />

        <SubscriptionChooser
          id="choose"
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

        <Shelf
          type="roasters-choice"
          heading="We choose the coffee"
          plans={shelves.roastersChoice}
        >
          {/* How a box works, beside the moment it describes: the
              coffee going into the bag. */}
          <div className="mt-section-sm grid items-center gap-stack-lg md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16">
            <Image
              src={SUBSCRIPTION_PHOTOS.roastersChoiceSteps.src}
              alt={SUBSCRIPTION_PHOTOS.roastersChoiceSteps.alt}
              width={SUBSCRIPTION_PHOTOS.roastersChoiceSteps.width}
              height={SUBSCRIPTION_PHOTOS.roastersChoiceSteps.height}
              sizes="(min-width: 768px) 22rem, 100vw"
              data-reveal
              className="aspect-[4/5] w-full rounded-card object-cover"
            />
            <div>
              <h3 className="text-h4">How a box works</h3>
              <ol className="mt-stack-md max-w-prose list-decimal space-y-stack-xs pl-5 text-body-m text-muted-foreground marker:text-muted-foreground">
                {HOME.subscription.roastersChoiceSteps.map((step) => (
                  <li key={step} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Shelf>

        <Shelf
          type="regular"
          heading="You choose the coffee"
          plans={shelves.regular}
        />

        <YegoLine reassurance={reassurances.shipping} className="mt-section-md" />
        <YegoLine reassurance={reassurances.cancellation} className="mt-stack-lg" />
      </Section>
    </main>
  );
}
