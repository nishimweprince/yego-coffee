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
 * Laid out as a shop shelf card (§108): a 316:373 photo on a white tile,
 * then the name, the roast and the price stacked beneath it — name
 * first, so titles line up across a row whether or not a roast note
 * follows. One hover for the whole card: the photo zooms and the name
 * takes the accent together, so the card reads as one destination.
 *
 * There is deliberately **no add-to-cart here.** Every product in this
 * catalogue carries a real choice (grind, size or roast), and a
 * one-click add would have to guess it on the customer's behalf.
 */
export function ProductCard({
  product,
  priority = false,
  revealOrder,
  className,
}: {
  product: ProductCardModel;
  priority?: boolean;
  /** Position in its row, for the scroll reveal's stagger. */
  revealOrder?: number;
  className?: string;
}) {
  const note = roastNote(product);
  const href = `/products/${product.handle}`;

  return (
    <article
      data-reveal
      style={
        revealOrder
          ? ({ "--reveal-order": revealOrder } as React.CSSProperties)
          : undefined
      }
      className={cn("group", className)}
    >
      {/* Duplicates the title link's destination, so it is skipped by
          assistive technology rather than announced twice. */}
      <Link href={href} className="block" tabIndex={-1} aria-hidden>
        <ProductMedia
          image={product.featuredImage}
          title={product.title}
          priority={priority}
          zoomOnHover
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[316/373] rounded-tile bg-surface-elevated"
        />
      </Link>

      <div className="mt-4">
        <h3 className="text-h4 font-semibold transition-colors duration-200 group-hover:text-accent">
          <Link href={href}>{product.title}</Link>
        </h3>

        {note || !product.availableForSale ? (
          <p className="mt-1 text-body-s text-muted-foreground">
            {[note, product.availableForSale ? null : "Sold out"]
              .filter(Boolean)
              .join(", ")}
          </p>
        ) : null}

        <PriceRange
          min={product.minPrice}
          max={product.maxPrice}
          className="mt-2 text-price-s font-bold text-muted-foreground"
        />
      </div>
    </article>
  );
}
