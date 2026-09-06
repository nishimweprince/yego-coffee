import type { Metadata } from "next";
import Image from "next/image";
import { QuizShell } from "@/components/quiz/quiz-shell";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { SUBSCRIPTION_PRODUCT_FOR_COFFEE } from "@/content/subscription";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { hasShopifyCredentials } from "@/lib/env";
import { flavourFromParam } from "@/lib/quiz/schema";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Find your coffee",
  description: "A few questions to match you to a roast and a rhythm.",
};

/**
 * The coffee quiz (plan.md §9, right-sized by §93.2).
 *
 * The server loads the catalogue in full — detail models, because
 * cadence and subscription price live on variant allocations — and
 * hands it to one client island. The recommendation is computed from
 * that data, so every product, variant, plan and price the customer
 * sees came from Shopify (§2.1, §62).
 */
export default async function QuizPage({ searchParams }: PageProps<"/quiz">) {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const { flavour } = await searchParams;
  const prefill = flavourFromParam(
    Array.isArray(flavour) ? flavour[0] : flavour,
  );

  const coffeeCollection = await getCollection(COLLECTION_HANDLES.coffee);

  const [coffees, subscriptionProducts] = await Promise.all([
    Promise.all(
      (coffeeCollection?.products ?? []).map((p) => getProduct(p.handle)),
    ),
    Promise.all(
      // Only the products the quiz can actually route to (§92.1's map),
      // not the whole subscriptions collection.
      [...new Set(Object.values(SUBSCRIPTION_PRODUCT_FOR_COFFEE).flat())].map(
        (handle) => getProduct(handle),
      ),
    ),
  ]);

  return (
    <main data-surface="wash" className="px-page-x py-section-md">
      <div className="mx-auto grid max-w-6xl items-stretch gap-stack-md lg:grid-cols-[1fr_0.7fr] lg:gap-16">
        <QuizShell
          coffees={coffees.filter((p) => p !== null)}
          subscriptionProducts={subscriptionProducts.filter((p) => p !== null)}
          prefill={prefill}
        />
        <div className="relative hidden min-h-[28rem] lg:block">
          <Image
            src="/brand/roast.jpg"
            alt="Freshly roasted Yego coffee"
            fill
            sizes="(min-width: 1024px) 30vw, 0px"
            loading="lazy"
            className="rounded-md object-cover"
          />
        </div>
      </div>
    </main>
  );
}
