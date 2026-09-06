import { formatMoneyCompact } from "@/lib/formatting/money";
import { cn } from "@/lib/utils";
import type { Money } from "@/lib/shopify/types";

/**
 * Every figure here originates in Shopify (§2.1). Nothing is computed
 * from a percentage, and no discount is inferred — if a compare-at
 * price is shown, Shopify supplied it.
 */
export function ProductPrice({
  price,
  compareAtPrice,
  className,
}: {
  price: Money;
  compareAtPrice?: Money | null;
  className?: string;
}) {
  const discounted =
    compareAtPrice != null &&
    Number.parseFloat(compareAtPrice.amount) > Number.parseFloat(price.amount);

  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className="type-figure text-price">
        {formatMoneyCompact(price)}
      </span>
      {discounted ? (
        <>
          <span className="text-body-s text-muted-foreground line-through">
            {formatMoneyCompact(compareAtPrice)}
          </span>
          <span className="sr-only">
            Reduced from {formatMoneyCompact(compareAtPrice)}
          </span>
        </>
      ) : null}
    </p>
  );
}

export function PriceRange({
  min,
  max,
  className,
}: {
  min: Money;
  max: Money;
  className?: string;
}) {
  const single = min.amount === max.amount;
  return (
    <p className={cn("type-figure text-price", className)}>
      {single
        ? formatMoneyCompact(min)
        : `${formatMoneyCompact(min)} – ${formatMoneyCompact(max)}`}
    </p>
  );
}
