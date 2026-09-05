import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * The duplicate subscription products (plan.md §92.1, §96.4).
 *
 * Yego's store still models subscriptions as eight standalone products:
 * searching "dark" returns Dark Roast alongside "Dark Roast - Monthly
 * Subscription" and "Dark Roast - Bi-Monthly Subscription", which reads
 * as three different coffees.
 *
 * The rule is deliberately narrow: a product is hidden only when it is
 * in the `subscriptions` collection **and** in neither of the canonical
 * ones. So when §92.1's consolidation attaches selling plans to the
 * real coffees, those coffees stay visible — they are in
 * `roasted-coffee` — and a product that simply has no collection yet is
 * never hidden by accident.
 *
 * This is presentation, not concealment: the duplicates remain
 * reachable at their own URLs, and §43 Phase 2 redirects them once the
 * consolidation lands.
 */
export function excludeDuplicates<T extends ProductCardModel>(
  products: T[],
  subscriptionHandles: ReadonlySet<string>,
  canonicalHandles: ReadonlySet<string>,
): T[] {
  return products.filter(
    (p) =>
      !subscriptionHandles.has(p.handle) || canonicalHandles.has(p.handle),
  );
}
