import type { ProductCardModel, ProductDetailModel } from "@/lib/shopify/types";

/**
 * Filters, right-sized to what Yego's data can actually answer
 * (plan.md §93.3, §96.4).
 *
 * Roast is the only facet with a real structured source. It comes from
 * two places, because Shopify holds it in two shapes: the three coffees
 * carry `light` / `medium` / `dark` product tags, and the 5 lb Bag
 * carries them as values of a `Roast` option.
 *
 * Deliberately not built:
 *
 *   Format (12 oz / 5 lb) — §93.3 asks for it, but the 5 lb Bag has no
 *     Size option at all, so a third of the catalogue could only be
 *     placed by parsing its title. A filter that silently misfiles a
 *     product is worse than no filter.
 *   Origin, process, brew method, decaf — §93.3 already cut these, and
 *     §96.4 confirms there is no metafield data behind any of them.
 *   Subscription availability — only Gatare's 5 lb variant qualifies
 *     today (§96.5), so the facet would return one variant of one
 *     product and imply the others cannot be subscribed to, which is a
 *     store-configuration artefact rather than a fact about the coffee.
 */

export const ROASTS = ["light", "medium", "dark"] as const;
export type Roast = (typeof ROASTS)[number];

export const ROAST_LABELS: Record<Roast, string> = {
  light: "Light",
  medium: "Medium",
  dark: "Dark",
};

function isRoast(value: string): value is Roast {
  return (ROASTS as readonly string[]).includes(value);
}

/** Every roast a product can be bought in. Empty for non-coffee. */
export function roastsOf(
  product: ProductCardModel | ProductDetailModel,
): Roast[] {
  const fromTags = product.tags
    .map((t) => t.trim().toLowerCase())
    .filter(isRoast);

  const fromOptions = product.options
    .filter((o) => o.name.trim().toLowerCase() === "roast")
    .flatMap((o) => o.values.map((v) => v.trim().toLowerCase()))
    .filter(isRoast);

  return [...new Set([...fromTags, ...fromOptions])];
}

/** Products matching any selected roast. No selection matches all. */
export function filterByRoast<T extends ProductCardModel>(
  products: T[],
  selected: Roast[],
): T[] {
  if (selected.length === 0) return products;
  return products.filter((p) => roastsOf(p).some((r) => selected.includes(r)));
}

/**
 * Roasts worth offering, with counts, derived from what is on the shelf
 * — never a fixed list. §93.3's warning applies: a facet that matches
 * every product tells the customer nothing.
 */
export function availableRoasts(
  products: ProductCardModel[],
): Array<{ value: Roast; label: string; count: number }> {
  const counts = new Map<Roast, number>();
  for (const p of products)
    for (const r of roastsOf(p)) counts.set(r, (counts.get(r) ?? 0) + 1);

  return ROASTS.filter((r) => counts.has(r)).map((r) => ({
    value: r,
    label: ROAST_LABELS[r],
    count: counts.get(r) ?? 0,
  }));
}

/**
 * Query string → selection (§12.2). Unknown values are dropped rather
 * than rejected: a stale or hand-edited URL should degrade to a wider
 * listing, never to an error page.
 */
export function parseRoastParam(param: string | string[] | undefined): Roast[] {
  if (!param) return [];
  const raw = Array.isArray(param) ? param : param.split(",");
  return [
    ...new Set(raw.map((v) => v.trim().toLowerCase()).filter(isRoast)),
  ];
}

/** Selection → query string, so filters stay shareable (§12.2). */
export function roastParamValue(selected: Roast[]): string | null {
  const ordered = ROASTS.filter((r) => selected.includes(r));
  return ordered.length ? ordered.join(",") : null;
}
