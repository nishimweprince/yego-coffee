import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * The lineup, laid out for the number of things in it.
 *
 * A fixed three-column grid left Yego's four coffees as a row of three
 * and one stranded card beside two empty cells, and the single mug as
 * a card floating in a third of a row. Neither reads as a decision.
 *
 * Four coffees is the whole catalogue, so four goes to a 2×2: bigger
 * cards, no hole, and it reads as a lineup rather than as page one of
 * a longer list.
 */
const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1 lg:grid-cols-2",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2",
};

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

  const columns = COLUMNS[products.length] ?? "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-x-6 gap-y-12", columns, className)}>
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
