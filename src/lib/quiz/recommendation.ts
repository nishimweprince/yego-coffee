import { formatCadence } from "@/lib/shopify/cadence";
import { SUBSCRIPTION_PRODUCT_FOR_COFFEE } from "@/content/subscription";
import { recommend } from "./engine";
import { explain } from "./reasons";
import {
  bagsPerDelivery,
  prefersBulk,
  suggestCadence,
  variantGrams,
} from "./quantity";
import type { QuizAnswers } from "./schema";
import { cadenceInDays } from "@/lib/shopify/cadence";
import type {
  Money,
  ProductDetailModel,
  ProductVariantModel,
  SubscriptionOptionModel,
} from "@/lib/shopify/types";

/**
 * The whole recommendation, assembled under §62's rules.
 *
 * The order matters and is §62's: score, drop what cannot be bought,
 * confirm the variant, confirm the selling-plan allocation, choose the
 * best valid plan, and only then build what the customer sees. Nothing
 * in the result is presentational until it has been checked against
 * Shopify's own data.
 */

export type QuizRecommendation = {
  /** The coffee itself — always a real, purchasable product. */
  product: ProductDetailModel;
  variant: ProductVariantModel;
  /** Second-best match, for §9.6's "want something brighter?" slot. */
  alternate: ProductDetailModel | null;
  quantity: number;
  unitPrice: Money;
  reasons: string[];
  /**
   * Present only when this coffee can genuinely be subscribed to. Null
   * means one-time purchase, and the UI must say why rather than
   * quietly dropping the subscription (§92.1, §96.5).
   */
  subscription: {
    /** The product actually added to the cart — a duplicate (§92.1). */
    productHandle: string;
    variantId: string;
    option: SubscriptionOptionModel;
    unitPrice: Money;
  } | null;
};

/** Picks the variant matching the customer's size and grind answers. */
function chooseVariant(
  product: ProductDetailModel,
  answers: QuizAnswers,
): ProductVariantModel | null {
  const sellable = product.variants.filter((v) => v.availableForSale);
  if (sellable.length === 0) return null;

  const wantsBulk = prefersBulk(answers.cupsPerDay);

  const byGrind = answers.grind
    ? sellable.filter((v) =>
        v.selectedOptions.some((o) =>
          answers.grind === "ground"
            ? /^ground$/i.test(o.value)
            : /whole\s*beans?/i.test(o.value),
        ),
      )
    : sellable;

  const candidates = byGrind.length > 0 ? byGrind : sellable;

  // Largest bag when they drink a lot, smallest otherwise — but only
  // among variants whose weight can actually be read (§9.5).
  const weighed = candidates
    .map((variant) => ({ variant, grams: variantGrams(variant) }))
    .filter((entry): entry is { variant: ProductVariantModel; grams: number } =>
      entry.grams !== null,
    );

  if (weighed.length === 0) return candidates[0];

  weighed.sort((a, b) => (wantsBulk ? b.grams - a.grams : a.grams - b.grams));
  return weighed[0].variant;
}

/**
 * The subscription for a recommended coffee, or null.
 *
 * §62 steps 4 and 5: the allocation must exist on the variant we intend
 * to sell, and the plan must state a cadence. A mapping that no longer
 * resolves degrades to a one-time purchase instead of failing.
 */
function findSubscription(
  coffee: ProductDetailModel,
  variant: ProductVariantModel,
  subscriptionProducts: ProductDetailModel[],
  answers: QuizAnswers,
): QuizRecommendation["subscription"] {
  const handles = SUBSCRIPTION_PRODUCT_FOR_COFFEE[coffee.handle] ?? [];
  if (handles.length === 0) return null;

  const grams = variantGrams(variant);

  /**
   * What the customer actually chose, so the subscription line sells
   * the same thing the quiz recommended. Grind is scored separately
   * from size: both subscription variants are "12 oz", so matching on
   * any shared option value picked whichever came first and silently
   * handed a Ground drinker whole beans.
   */
  const wantedGrind = variant.selectedOptions.find((o) =>
    /ground|whole\s*beans?/i.test(o.value),
  )?.value;

  const candidates: Array<{
    productHandle: string;
    variantId: string;
    option: SubscriptionOptionModel;
    unitPrice: Money;
    grindMatches: boolean;
  }> = [];

  for (const handle of handles) {
    const product = subscriptionProducts.find((p) => p.handle === handle);
    if (!product?.availableForSale) continue;

    for (const subVariant of product.variants) {
      if (!subVariant.availableForSale) continue;

      // Grind spellings differ across products — "Whole Beans", "Whole
      // Bean", "Whole bean" all appear (§96.3) — so compare on the
      // concept, not the string.
      const grindMatches = wantedGrind
        ? subVariant.selectedOptions.some((o) =>
            /ground/i.test(wantedGrind)
              ? /^ground$/i.test(o.value)
              : /whole\s*beans?/i.test(o.value),
          )
        : true;

      for (const option of subVariant.subscriptionOptions) {
        if (!formatCadence(option.interval, option.intervalCount)) continue;
        candidates.push({
          productHandle: product.handle,
          variantId: subVariant.id,
          option,
          unitPrice: option.price,
          grindMatches,
        });
      }
    }
  }

  // Honour the grind if any candidate offers it; never drop the whole
  // subscription because a duplicate product lacks the option.
  const grindMatched = candidates.filter((c) => c.grindMatches);
  const usable = grindMatched.length > 0 ? grindMatched : candidates;

  if (usable.length === 0) return null;

  // If they picked a cadence, honour it. Otherwise suggest the rhythm
  // that lands closest to one bag per delivery (§93.2 Q03).
  const chosen =
    usable.find((c) => c.option.sellingPlanId === answers.sellingPlanId) ??
    (() => {
      const suggested = suggestCadence(
        usable.map((c) => c.option),
        { cupsPerDay: answers.cupsPerDay, gramsPerBag: grams },
      );
      return (
        usable.find(
          (c) => c.option.sellingPlanId === suggested?.sellingPlanId,
        ) ?? usable[0]
      );
    })();

  return {
    productHandle: chosen.productHandle,
    variantId: chosen.variantId,
    option: chosen.option,
    unitPrice: chosen.unitPrice,
  };
}

export function buildRecommendation(
  coffees: ProductDetailModel[],
  subscriptionProducts: ProductDetailModel[],
  answers: QuizAnswers,
): QuizRecommendation | null {
  const match = recommend(coffees, answers);
  if (!match) return null;

  const variant = chooseVariant(match.primary, answers);
  if (!variant) return null;

  const subscription = findSubscription(
    match.primary,
    variant,
    subscriptionProducts,
    answers,
  );

  const grams = variantGrams(variant);
  const days = subscription
    ? cadenceInDays(
        subscription.option.interval,
        subscription.option.intervalCount,
      )
    : null;

  const bags = bagsPerDelivery({
    cupsPerDay: answers.cupsPerDay,
    gramsPerBag: grams,
    daysPerCycle: days,
  });

  const cadenceLabel = subscription
    ? formatCadence(
        subscription.option.interval,
        subscription.option.intervalCount,
      )
    : null;

  return {
    product: match.primary,
    variant,
    alternate: match.alternates[0] ?? null,
    quantity: bags ?? 1,
    unitPrice: variant.price,
    reasons: explain(match.primary, answers, {
      bagsPerDelivery: bags,
      cadenceLabel,
    }),
    subscription,
  };
}
