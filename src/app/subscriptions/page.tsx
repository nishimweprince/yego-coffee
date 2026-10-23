import type { Metadata } from "next";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { PlanList } from "@/components/commerce/plan-list";
import { YegoLine } from "@/components/ui/yego-line";
import { HOME } from "@/content/home";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { featuredPlans, summarisePlans } from "@/lib/catalog/plans";
import { getReassurances } from "@/lib/content/reassurance";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Coffee once or twice a month, roasted in Somerville.",
};

/**
 * Subscriptions.
 *
 * The plans lead and the mechanics follow: someone arriving here has
 * already decided to consider a subscription and wants to know what is
 * on offer, not how the process works.
 *
 * §10.5 lists four benefits including "Save on every delivery". That
 * one is not shown: every selling plan in this store adjusts price by
 * 0% (§96.5). The true ones are one plain sentence under the title,
 * not a row of labels.
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
  const plans = featuredPlans(
    summarisePlans(planProducts.filter((p) => p !== null)),
    HOME.subscription.featuredHandles,
  );

  return (
    <main>
      <Section>
        <PageHeader
          align="center"
          title={HOME.subscription.heading}
          lede={HOME.subscription.lede}
        />

        <PlanList plans={plans} className="mt-section-sm" />

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
