import type { Metadata } from "next";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { SubscriptionGrid } from "@/components/commerce/subscription-tile";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { summarisePlans } from "@/lib/catalog/plans";
import { getReassurances } from "@/lib/content/reassurance";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Subscriptions",
  description:
    "Roaster's Choice coffee by subscription, roasted in Somerville and delivered on your schedule.",
};

/**
 * Subscriptions.
 *
 * The plans lead and the mechanics follow: someone arriving here has
 * already decided to consider a subscription and wants to know what is
 * on offer, not how the process works.
 *
 * The plans are a shop shelf (§109): one tile per Roaster's Choice
 * size, with the per-bag price and the saving a larger box earns —
 * both worked out from Shopify's prices, not claimed. Selling plans
 * themselves still adjust by 0% (§96.5), so nothing says a subscription
 * is cheaper than buying once.
 *
 * The two questions that stop a subscription — what does shipping
 * cost, and can I get out of it — are each answered once, beside the
 * plans, with the store's own policy sentence and a link to the full
 * document (§107). The page used to also paste the cancellation policy
 * in full and restate both answers as a "What you get" list; three
 * answers to two questions read as small print, not reassurance.
 */
export default async function SubscriptionsPage() {
  if (!hasShopifyCredentials()) {
    return (
      <Section as="div">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </Section>
    );
  }

  const [subscriptions, reassurances] = await Promise.all([
    getCollection(COLLECTION_HANDLES.subscriptions),
    getReassurances(),
  ]);

  const planProducts = await Promise.all(
    (subscriptions?.products ?? []).map((p) => getProduct(p.handle)),
  );
  // Every plan the subscriptions collection publishes (§109). The list
  // follows the store: there are no handles here to fall out of step.
  const plans = summarisePlans(planProducts.filter((p) => p !== null));

  return (
    <main>
      <Section>
        <PageHeader
          align="center"
          title={HOME.subscription.heading}
          lede={HOME.subscription.lede}
        />

        <SubscriptionGrid plans={plans} className="mt-15" />

        <ol className="mt-section-sm max-w-prose list-decimal space-y-stack-xs pl-5 text-body-m text-muted-foreground marker:text-muted-foreground">
          {HOME.subscription.steps.map((step) => (
            <li key={step} className="pl-1">
              {step}
            </li>
          ))}
        </ol>

        <YegoLine reassurance={reassurances.shipping} className="mt-section-md" />
        <YegoLine reassurance={reassurances.cancellation} className="mt-stack-lg" />
      </Section>
    </main>
  );
}
