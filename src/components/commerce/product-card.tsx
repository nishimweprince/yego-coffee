import Link from "next/link";
import { PriceRange } from "./product-price";
import { ProductMedia } from "./product-media";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * Editorial by default: the whole card is one link, the image carries
 * the weight, and metadata sits quietly beneath it (§12.3, §17.1).
 * Hover lifts the card and hands the title to the accent colour —
 * the card is a doorway, and it should feel like one.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductCardModel;
  priority?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("group", className)}>

      <Link
        href={`/products/${product.handle}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <ProductMedia
          image={product.featuredImage}
          title={product.title}
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="rounded-md bg-surface-elevated"
        />

        <div className="mt-stack-md px-1 pb-1">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-h3 transition-colors group-hover:text-accent">
              {product.title}
            </h3>
            <PriceRange min={product.minPrice} max={product.maxPrice} />
          </div>

          {!product.availableForSale ? (
            <p className="label mt-stack-sm text-muted-foreground">
              Sold out
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
