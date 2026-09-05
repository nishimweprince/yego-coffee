import { ROAST_LABELS, roastsOf } from "@/lib/catalog/facets";
import type { ProductDetailModel } from "@/lib/shopify/types";

/**
 * Product storytelling (plan.md §13), built from what Shopify actually
 * holds.
 *
 * §13 asks for origin, producer, process, variety, altitude, roasting
 * intent and brew guidance, and §17 wants a tactile Body / Acidity /
 * Sweetness scale. **None of that data exists.** Yego's store has no
 * metafields at all (§96.4) — no origin, no process, no altitude, no
 * flavour values.
 *
 * §71 and §93.5 are explicit that the response to missing product data
 * is to leave it out, not to write it. A sweetness scale rendered at a
 * plausible-looking three-fifths would be a fabricated tasting note
 * with a graphic around it, and would be indistinguishable from a real
 * measurement to a customer.
 *
 * So this renders only facts with a source: the roast, the sizes and
 * the grinds Shopify sells. The sections in §13 arrive when the
 * metafields in §5.1 are populated in the admin.
 */
export function ProductFacts({ product }: { product: ProductDetailModel }) {
  const roasts = roastsOf(product);

  const facts: Array<{ label: string; value: string }> = [];

  if (roasts.length > 0) {
    facts.push({
      label: roasts.length > 1 ? "Roasts" : "Roast",
      value: roasts.map((r) => ROAST_LABELS[r]).join(" · "),
    });
  }

  for (const option of product.options) {
    // A single-value option is Shopify's synthetic default, not a fact.
    if (option.values.length < 2) continue;
    if (option.name.trim().toLowerCase() === "roast") continue;
    facts.push({ label: option.name, value: option.values.join(" · ") });
  }

  if (facts.length === 0) return null;

  return (
    <dl className="grid gap-x-8 gap-y-stack-md sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="label text-muted-foreground">{fact.label}</dt>
          <dd className="mt-stack-xs text-body-m">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
