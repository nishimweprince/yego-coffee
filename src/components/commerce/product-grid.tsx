import { ProductCard } from "./product-card";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * Four coffees read better as large editorial cards than as a dense
 * grid (plan.md §93.3 — presentation over filtering). The column count
 * is deliberately low so each product keeps a real share of the screen.
 */
export function ProductGrid({
  products,
  priorityCount = 3,
}: {
  products: ProductCardModel[];
  priorityCount?: number;
}) {
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
