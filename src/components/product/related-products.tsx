import { ProductGrid } from "@/components/commerce/product-grid";
import { Contour } from "@/components/ui/contour";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * Related coffees (plan.md §13, §56 option B/C).
 *
 * Drawn from the same Shopify collection rather than an algorithm: with
 * three coffees, "related" and "the rest of the lineup" are the same
 * set, and a recommendation engine over it would be decoration (§93).
 */
export function RelatedProducts({
  products,
  heading = "The rest of the lineup",
}: {
  products: ProductCardModel[];
  heading?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section
      aria-label={heading}
      data-surface="wash"
      className="px-page-x py-section-md"
    >
      <div className="mx-auto max-w-6xl">
        <Contour label={heading} />
        <ProductGrid
          products={products}
          priorityCount={0}
          className="mt-section-sm"
        />
      </div>
    </section>
  );
}
