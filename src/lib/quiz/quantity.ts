import { cadenceInDays } from "@/lib/shopify/cadence";
import type { ProductVariantModel, SubscriptionOptionModel } from "@/lib/shopify/types";

/**
 * How much coffee, how often (plan.md §9.5).
 *
 * §9.5 insists the arithmetic stays transparent and that the result is
 * presented as an estimate — "this should keep you stocked without
 * leaving coffee sitting around too long", not a promise. These
 * constants are the assumptions, in one place, so they can be argued
 * with.
 */

/** A generous single cup. §9.5's stated assumption. */
export const GRAMS_PER_CUP = 18;

/**
 * What Shopify's size options weigh. Yego sells 12 oz and 5 lb, and
 * neither weight is anywhere in the API — it is in the option's name.
 * Parsed rather than hardcoded per handle, so a new size works, and
 * a size that cannot be parsed is skipped rather than guessed.
 */
export function variantGrams(variant: ProductVariantModel): number | null {
  const text = [
    variant.title,
    ...variant.selectedOptions.map((o) => o.value),
  ].join(" ");

  const ounces = text.match(/(\d+(?:\.\d+)?)\s*oz\b/i);
  if (ounces) return Number(ounces[1]) * 28.3495;

  const pounds = text.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b/i);
  if (pounds) return Number(pounds[1]) * 453.592;

  return null;
}

/**
 * Bags needed to cover one delivery cycle, rounded up: running out
 * early is a worse failure than a little surplus, and §9.5 asks for
 * "stocked without leaving coffee sitting around".
 *
 * Returns null when the cadence or the bag weight is unknown, because
 * the honest response to an unknown input is to not state a number.
 */
export function bagsPerDelivery({
  cupsPerDay,
  gramsPerBag,
  daysPerCycle,
}: {
  cupsPerDay: number;
  gramsPerBag: number | null;
  daysPerCycle: number | null;
}): number | null {
  if (!gramsPerBag || !daysPerCycle) return null;
  if (cupsPerDay < 1) return null;

  const needed = GRAMS_PER_CUP * cupsPerDay * daysPerCycle;
  return Math.max(1, Math.ceil(needed / gramsPerBag));
}

/**
 * The cadence whose bag count lands closest to one bag per delivery —
 * the rhythm that suits how much they actually drink, rather than the
 * cheapest or the most frequent.
 *
 * §93.2's Q03 shows this pre-selected and adjustable: "never a blind
 * choice".
 */
export function suggestCadence(
  options: SubscriptionOptionModel[],
  {
    cupsPerDay,
    gramsPerBag,
  }: { cupsPerDay: number; gramsPerBag: number | null },
): SubscriptionOptionModel | null {
  const scored = options
    .map((option) => {
      const bags = bagsPerDelivery({
        cupsPerDay,
        gramsPerBag,
        daysPerCycle: cadenceInDays(option.interval, option.intervalCount),
      });
      return bags === null ? null : { option, bags };
    })
    .filter((entry): entry is { option: SubscriptionOptionModel; bags: number } =>
      entry !== null,
    );

  if (scored.length === 0) return options[0] ?? null;

  return scored.sort((a, b) => Math.abs(a.bags - 1) - Math.abs(b.bags - 1))[0]
    .option;
}

/**
 * §93.2: six or more cups a day across everyone drinking it routes
 * toward the 5 lb bag. Below that, a 12 oz bag is the sensible unit.
 */
export const BULK_CUPS_THRESHOLD = 6;

export function prefersBulk(cupsPerDay: number): boolean {
  return cupsPerDay >= BULK_CUPS_THRESHOLD;
}
