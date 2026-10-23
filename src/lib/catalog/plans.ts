import { byLongestInterval, formatCadence } from "@/lib/shopify/cadence";
import type {
  ProductDetailModel,
  Money,
  ShopifyImage,
  SubscriptionOptionModel,
} from "@/lib/shopify/types";

/**
 * A subscription product, summarised for a listing (plan.md §8.7,
 * §90.07, §109).
 *
 * Cadences are the distinct delivery intervals a customer can actually
 * choose, generated from each plan's `deliveryPolicy`. A plan whose
 * policy Shopify does not state contributes no label rather than a
 * vague one (§96.3).
 *
 * `perBag` and `savingPerDelivery` exist only when the product carries
 * `custom.bags_per_delivery`. Both are arithmetic on Shopify's own
 * prices — the saving is measured against the one-bag plan in the same
 * list, never against a percentage written here (§2.1).
 */
export type SubscriptionPlanSummary = {
  handle: string;
  title: string;
  image: ShopifyImage | null;
  minPrice: Money;
  maxPrice: Money;
  cadences: string[];
  /** The intervals behind `cadences`, for ordering across plans. */
  intervals: Interval[];
  bags: number | null;
  perBag: Money | null;
  savingPerDelivery: Money | null;
};

type Interval = Pick<SubscriptionOptionModel, "interval" | "intervalCount">;

/** Distinct intervals, least frequent first, keeping only describable ones. */
function describable(intervals: Interval[]): Interval[] {
  const seen = new Map<string, Interval>();
  for (const i of byLongestInterval(intervals)) {
    const label = formatCadence(i.interval, i.intervalCount);
    if (label && !seen.has(label)) seen.set(label, i);
  }
  return [...seen.values()];
}

function toCents(money: Money): number {
  return Math.round(Number.parseFloat(money.amount) * 100);
}

function fromCents(cents: number, currencyCode: string): Money {
  return { amount: (cents / 100).toFixed(2), currencyCode };
}

/** A delivery's price divided by its bags, to the cent. */
export function perBagPrice(price: Money, bags: number | null): Money | null {
  if (!bags || bags < 1) return null;
  return fromCents(Math.round(toCents(price) / bags), price.currencyCode);
}

/**
 * Every product in the subscriptions collection, as Shopify publishes
 * it. There is no list of handles to keep in step with the store
 * (§109): a plan the owners add appears, and one they archive goes.
 *
 * Ordered by bag count when every plan states one, which is the order
 * a customer compares them in; otherwise in the collection's own order.
 */
export function summarisePlans(
  products: ProductDetailModel[],
): SubscriptionPlanSummary[] {
  const plans = products.map((product) => {
    const intervals = describable(
      product.variants.flatMap((variant) => variant.subscriptionOptions),
    );

    return {
      handle: product.handle,
      title: product.title,
      image: product.featuredImage,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      cadences: intervals.map(
        (i) => formatCadence(i.interval, i.intervalCount) as string,
      ),
      intervals,
      bags: product.bagsPerDelivery,
      perBag: perBagPrice(product.minPrice, product.bagsPerDelivery),
      savingPerDelivery: null as Money | null,
    };
  });

  const single = plans.find((plan) => plan.bags === 1);
  for (const plan of plans) {
    if (!single || !plan.bags || plan.bags < 2) continue;
    if (plan.minPrice.currencyCode !== single.minPrice.currencyCode) continue;
    const saving = toCents(single.minPrice) * plan.bags - toCents(plan.minPrice);
    if (saving > 0) {
      plan.savingPerDelivery = fromCents(saving, plan.minPrice.currencyCode);
    }
  }

  return plans.every((plan) => plan.bags !== null)
    ? plans.toSorted((a, b) => (a.bags ?? 0) - (b.bags ?? 0))
    : plans;
}

/**
 * Every cadence offered across the plans, monthly first, as one
 * sentence: "Delivered once a month or every 2 weeks." Stated once
 * under the plans rather than on every tile, because every Roaster's
 * Choice plan offers the same two. Null when no plan states one.
 */
export function cadenceSentence(
  plans: SubscriptionPlanSummary[],
): string | null {
  const cadences = describable(plans.flatMap((plan) => plan.intervals)).map(
    (i) => formatCadence(i.interval, i.intervalCount) as string,
  );
  if (cadences.length === 0) return null;

  const list = new Intl.ListFormat("en-US", { type: "disjunction" }).format(
    cadences.map((c) => c.charAt(0).toLowerCase() + c.slice(1)),
  );
  return `Delivered ${list}.`;
}
