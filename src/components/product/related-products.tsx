import { ProductGrid } from "@/components/commerce/product-grid";
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
  heading = "You might also like",
}: {
  products: ProductCardModel[];
  heading?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="px-page-x py-section-md">
      <div className="mx-auto max-w-page">
        <h2 id="related-heading" data-reveal className="text-h3">
          {heading}
        </h2>
        <ProductGrid
          products={products}
          priorityCount={0}
          className="mt-15"
        />
      </div>
    </section>
  );
}
