import { byLongestInterval, formatCadence } from "@/lib/shopify/cadence";
import {
  bagCountFromHandle,
  getSubscriptionType,
  regularCoffeeKey,
  regularCoffeeTitle,
  type SubscriptionType,
} from "./subscription-type";
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
  /** Regular or Roaster's Choice (§110); null for anything else. */
  type: SubscriptionType | null;
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
    // The metafield is the source; the handle states the same count
    // ("roasters-choice-two-bags-…") while the metafield is unreadable.
    const bags = product.bagsPerDelivery ?? bagCountFromHandle(product.handle);

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
      bags,
      perBag: perBagPrice(product.minPrice, bags),
      savingPerDelivery: null as Money | null,
      type: getSubscriptionType(product),
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

/** The lowest price across a shelf: the "From $17" on the chooser. */
export function lowestPrice(plans: SubscriptionPlanSummary[]): Money | null {
  if (plans.length === 0) return null;
  return plans.reduce((a, b) =>
    toCents(b.minPrice) < toCents(a.minPrice) ? b : a,
  ).minPrice;
}

/**
 * The plans in their two shelves (§110).
 *
 * Roaster's Choice keeps its bag order, with any plan that states no
 * bag count — the two Drops — after the boxes, in the collection's
 * order.
 *
 * Regular coffees are each two Shopify products, one per cadence.
 * They are folded into one tile per coffee, linked to the monthly
 * product, with both cadences and the full price range; the product
 * page links across to the other schedule. Plans of neither type are
 * left out rather than guessed into a shelf.
 */
export function groupPlans(plans: SubscriptionPlanSummary[]): {
  roastersChoice: SubscriptionPlanSummary[];
  regular: SubscriptionPlanSummary[];
} {
  const roastersChoice = plans
    .filter((plan) => plan.type === "roasters-choice")
    .map((plan, index) => ({ plan, index }))
    .toSorted(
      (a, b) =>
        (a.plan.bags ?? Infinity) - (b.plan.bags ?? Infinity) ||
        a.index - b.index,
    )
    .map(({ plan }) => plan);

  const byCoffee = new Map<string, SubscriptionPlanSummary[]>();
  for (const plan of plans) {
    if (plan.type !== "regular") continue;
    const key = regularCoffeeKey(plan.handle);
    byCoffee.set(key, [...(byCoffee.get(key) ?? []), plan]);
  }

  const regular = [...byCoffee.values()].map((siblings) => {
    const lead =
      siblings.find((plan) => !plan.handle.includes("-bi-monthly-")) ??
      siblings[0];
    const intervals = describable(siblings.flatMap((plan) => plan.intervals));
    const cheapest = siblings.reduce((a, b) =>
      toCents(b.minPrice) < toCents(a.minPrice) ? b : a,
    );
    const dearest = siblings.reduce((a, b) =>
      toCents(b.maxPrice) > toCents(a.maxPrice) ? b : a,
    );

    return {
      ...lead,
      title: regularCoffeeTitle(lead.title),
      image: lead.image ?? siblings.find((plan) => plan.image)?.image ?? null,
      minPrice: cheapest.minPrice,
      maxPrice: dearest.maxPrice,
      intervals,
      cadences: intervals.map(
        (i) => formatCadence(i.interval, i.intervalCount) as string,
      ),
    };
  });

  return { roastersChoice, regular };
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
