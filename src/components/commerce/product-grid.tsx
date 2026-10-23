import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * The lineup, as a shop shelf (§108, docs/starbucks-parity.md).
 *
 * One card per row on a phone, two on a tablet, four from a laptop up,
 * with an even 32px gap. Yego's four coffees fill one row exactly; a
 * shorter list sits left-aligned on the same rhythm rather than
 * stretching to fill it, so every card on the site is the same size.
 *
 * Each card is revealed as it scrolls in, a beat after the one before
 * it in the row.
 */
export function ProductGrid({
  products,
  priorityCount = 3,
  className,
}: {
  products: ProductCardModel[];
  priorityCount?: number;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < priorityCount}
          revealOrder={(i % 4) + 1}
        />
      ))}
    </div>
  );
}
