import { ProductCard } from "@/components/commerce/product-card";
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
    <section className="mt-section-lg">
      <Contour label={heading} />
      <div className="mt-section-sm grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
