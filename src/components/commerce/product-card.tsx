import Link from "next/link";
import { PriceRange } from "./product-price";
import { ProductMedia } from "./product-media";
import { roastNote } from "@/lib/catalog/facets";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * Editorial by default: the image carries the weight and metadata sits
 * quietly beneath it (§12.3, §17.1).
 *
 * Photo, name, price — and the roast only when the name does not
 * already say it. The "Choose options" button that sat under every
 * card was cut (§107): the whole card already leads to the product,
 * and a grid of identical outlined buttons read as template chrome.
 *
 * One hover for the whole card: the photo leans in and the title turns
 * roast together, so the card reads as one destination.
 *
 * There is deliberately **no add-to-cart here.** Every product in this
 * catalogue carries a real choice (grind, size or roast), and a
 * one-click add would have to guess it on the customer's behalf.
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
  const note = roastNote(product);
  const href = `/products/${product.handle}`;

  return (
    <article className={cn("group", className)}>
      {/* Duplicates the title link's destination, so it is skipped by
          assistive technology rather than announced twice. */}
      <Link href={href} className="block" tabIndex={-1} aria-hidden>
        <ProductMedia
          image={product.featuredImage}
          title={product.title}
          priority={priority}
          zoomOnHover
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="rounded-sm bg-surface-elevated"
        />
      </Link>

      <div className="mt-stack-md">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-h3 transition-colors group-hover:text-accent">
            <Link href={href}>{product.title}</Link>
          </h3>
          <PriceRange min={product.minPrice} max={product.maxPrice} />
        </div>

        {note || !product.availableForSale ? (
          <p className="mt-stack-xs label text-muted-foreground">
            {[note, product.availableForSale ? null : "Sold out"]
              .filter(Boolean)
              .join(", ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
