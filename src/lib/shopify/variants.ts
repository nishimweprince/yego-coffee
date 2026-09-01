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
