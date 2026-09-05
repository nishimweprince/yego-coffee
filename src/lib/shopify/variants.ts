import type { ProductVariantModel, SelectedOption } from "./types";

/**
 * Option/variant resolution.
 *
 * Kept pure and separate from React so the matching rules are testable
 * without rendering, and so the PDP and the quiz (Phase 5) can share
 * one implementation.
 */

export function optionsMatch(
  variant: ProductVariantModel,
  selection: Record<string, string>,
): boolean {
  const entries = Object.entries(selection);
  if (entries.length === 0) return false;
  return entries.every((entry) =>
    variant.selectedOptions.some(
      (o) => o.name === entry[0] && o.value === entry[1],
    ),
  );
}

export function findVariant(
  variants: ProductVariantModel[],
  selection: Record<string, string>,
): ProductVariantModel | null {
  return variants.find((v) => optionsMatch(v, selection)) ?? null;
}

export function selectionFromVariant(
  variant: ProductVariantModel,
): Record<string, string> {
  return Object.fromEntries(
    variant.selectedOptions.map((o: SelectedOption) => [o.name, o.value]),
  );
}

/**
 * The variant a PDP should open on: first sellable one, falling back to
 * the first overall so a fully sold-out product still renders rather
 * than throwing.
 */
export function defaultVariant(
  variants: ProductVariantModel[],
): ProductVariantModel | null {
  return variants.find((v) => v.availableForSale) ?? variants[0] ?? null;
}

/**
 * Whether choosing `value` for `optionName` leads to any sellable
 * variant, given what else is already chosen. Drives the disabled state
 * on option buttons so customers are not walked into dead ends.
 */
export function isOptionValueAvailable(
  variants: ProductVariantModel[],
  selection: Record<string, string>,
  optionName: string,
  value: string,
): boolean {
  const candidate = { ...selection, [optionName]: value };
  return variants.some((v) => optionsMatch(v, candidate) && v.availableForSale);
}

/** Ceiling for a variant Shopify does not meaningfully track. */
const UNTRACKED_QUANTITY_CEILING = 99;

/**
 * How many of this variant the stepper may offer.
 *
 * Yego's store sells past zero: `medium-roast` reports a
 * `quantityAvailable` of −391 while `availableForSale` is true (§96.4).
 * Taking Shopify's number at face value gave the stepper a negative
 * ceiling, which clamps every quantity below its own minimum.
 *
 * A non-positive count on a sellable variant means "not usefully
 * tracked", not "none left" — availability is `availableForSale`'s
 * question, and it is asked separately.
 */
export function purchasableQuantity(
  variant: Pick<ProductVariantModel, "availableForSale" | "quantityAvailable">,
): number {
  if (!variant.availableForSale) return 0;

  const tracked = variant.quantityAvailable;
  if (tracked === null || tracked <= 0) return UNTRACKED_QUANTITY_CEILING;

  return tracked;
}
