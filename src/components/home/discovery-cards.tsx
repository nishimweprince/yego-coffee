import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import { ProductMedia } from "@/components/commerce/product-media";
import { PriceRange } from "@/components/commerce/product-price";
import { HOME } from "@/content/home";
import { ROAST_LABELS, roastsOf } from "@/lib/catalog/facets";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * "How do you take your coffee?" — the first dark band.
 *
 * On soil, because these are four packshots and they carry against
 * ink in a way they never did against paper. It is also the point
 * where the page stops being one flat field.
 *
 * Each card is a shopping aid, not a taxonomy: the flavour a visitor
 * recognises, then the coffee's real name, its roast, and its price.
 * Previously "Bright & Complex" sat above "Gatare Anaerobic Process"
 * with no price at all, which asked the visitor to click to find out
 * the one thing they wanted to know.
 *
 * A card either leads to the coffee it describes, or opens the quiz
 * with that preference already answered (the quiz reads `?flavour=`).
 *
 * **A Server Component.** Nothing here hydrates.
 */
export function DiscoveryCards({
  products,
}: {
  products: ProductCardModel[];
}) {
  const byHandle = new Map(products.map((product) => [product.handle, product]));

  return (
    <section
      aria-labelledby="discovery-heading"
      data-surface="soil"
      className="px-page-x py-section-md"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="discovery-heading"
          className="type-display max-w-[18ch] text-display-l"
        >
          {HOME.discovery.heading}
        </h2>

        <ul className="mt-section-sm grid gap-x-4 gap-y-stack-lg sm:grid-cols-2 lg:grid-cols-4">
          {HOME.discovery.cards.map((card) => {
            const href = card.productHandle
              ? `/products/${card.productHandle}`
              : `/quiz?flavour=${card.quizAnswer}`;
            const product = card.productHandle
              ? (byHandle.get(card.productHandle) ?? null)
              : null;
            const roasts = product ? roastsOf(product) : [];

            return (
              <li key={card.label}>
                <Link href={href} className="block">
                  {product ? (
                    <span className="block overflow-hidden rounded-sm">
                      <ProductMedia
                        image={product.featuredImage}
                        title={product.title}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="bg-muted"
                      />
                    </span>
                  ) : (
                    // Outlined rather than filled: three real packshots
                    // beside a flat grey rectangle read as a photograph
                    // that failed to load. This one is plainly a
                    // control, not a picture.
                    <span className="flex aspect-square flex-col items-center justify-center gap-stack-sm rounded-sm border border-rule">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        aria-hidden
                        className="h-6 w-6"
                      />
                      <span className="label text-muted-foreground">
                        Take the quiz
                      </span>
                    </span>
                  )}

                  <span className="mt-stack-md block font-display text-h3">
                    {card.label}
                  </span>

                  {product ? (
                    <>
                      <span className="mt-stack-xs block text-body-s text-muted-foreground">
                        {product.title}
                      </span>
                      <span className="mt-stack-sm flex items-baseline justify-between gap-3">
                        {roasts.length > 0 ? (
                          <span className="label text-muted-foreground">
                            {roasts.map((r) => ROAST_LABELS[r]).join(" · ")}
                          </span>
                        ) : (
                          <span />
                        )}
                        <PriceRange
                          min={product.minPrice}
                          max={product.maxPrice}
                        />
                      </span>
                    </>
                  ) : (
                    <span className="mt-stack-xs block text-body-s text-muted-foreground">
                      Answer a few questions and we will match you
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
