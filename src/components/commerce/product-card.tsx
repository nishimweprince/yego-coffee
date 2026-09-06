import Link from "next/link";
import { PriceRange } from "./product-price";
import { ProductMedia } from "./product-media";
import { buttonVariants } from "@/components/ui/button";
import { ROAST_LABELS, roastsOf } from "@/lib/catalog/facets";
import { cn } from "@/lib/utils";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * Editorial by default: the image carries the weight and metadata sits
 * quietly beneath it (§12.3, §17.1).
 *
 * The card now says what it costs, what roast it is, and what happens
 * when you click — it previously carried a title and a price inside one
 * undifferentiated link.
 *
 * There is deliberately **no add-to-cart here.** Every product in this
 * catalogue carries a real choice: the three coffees are sold whole
 * bean or ground, Gatare in two sizes, the 5 lb Bag in three roasts.
 * A one-click add would have to guess a grind on the customer's behalf
 * and would put the wrong bag in the cart. "Choose options" is the
 * honest label for what the next screen actually asks. If a
 * single-variant product is ever added to the store, this is the place
 * to revisit that.
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
  const roasts = roastsOf(product);
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
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="rounded-md bg-surface-elevated"
        />
      </Link>

      <div className="mt-stack-md">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-h3 transition-colors group-hover:text-accent">
            <Link href={href}>{product.title}</Link>
          </h3>
          <PriceRange min={product.minPrice} max={product.maxPrice} />
        </div>

        {roasts.length > 0 ? (
          <p className="mt-stack-xs label text-muted-foreground">
            {roasts.map((r) => ROAST_LABELS[r]).join(" · ")}
          </p>
        ) : null}

        {product.availableForSale ? (
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "mt-stack-md",
            )}
          >
            Choose options
            {/* Three cards in a row all reading "Choose options" are
                indistinguishable in a screen reader's link list. */}
            <span className="sr-only"> for {product.title}</span>
          </Link>
        ) : (
          <p className="label mt-stack-md text-muted-foreground">Sold out</p>
        )}
      </div>
    </article>
  );
}
