import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import { ProductMedia } from "@/components/commerce/product-media";
import { HOME } from "@/content/home";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * "How do you take your coffee?"
 *
 * Unboxed photographic choices: image first, metadata beneath, no
 * floating cards. A card either leads to the coffee it describes, or
 * opens the quiz with that preference already answered (the quiz reads
 * `?flavour=` on arrival). Each coffee card shows its real Shopify
 * packshot; the quiz card gets an icon instead of a borrowed photo.
 *
 * **A Server Component.** Hover states are `:hover` / `:focus-within`
 * in CSS — do not hydrate static editorial content.
 */
export function DiscoveryCards({
  products,
}: {
  products: ProductCardModel[];
}) {
  const byHandle = new Map(products.map((product) => [product.handle, product]));

  return (
    <ul className="grid gap-x-4 gap-y-stack-lg sm:grid-cols-2 lg:grid-cols-4">
      {HOME.discovery.cards.map((card) => {
        const href = card.productHandle
          ? `/products/${card.productHandle}`
          : `/quiz?flavour=${card.quizAnswer}`;
        const product = card.productHandle
          ? (byHandle.get(card.productHandle) ?? null)
          : null;

        return (
          <li key={card.label} className="group">
            <Link href={href} className="block">
              {product ? (
                <span className="block overflow-hidden rounded-sm">
                  <ProductMedia
                    image={product.featuredImage}
                    title={product.title}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="bg-muted transition-transform duration-300 ease-(--ease-brand) group-hover:scale-[1.02]"
                  />
                </span>
              ) : (
                <span className="flex aspect-square items-center justify-center rounded-sm bg-muted">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    aria-hidden
                    className="h-6 w-6 text-accent"
                  />
                </span>
              )}
              <span className="mt-stack-md block">
                <span className="label text-muted-foreground">
                  {card.productHandle ? "Coffee" : "Quiz"}
                </span>
                <span className="mt-stack-xs block font-display text-h3">
                  {card.label}
                </span>
                {product ? (
                  <span className="mt-stack-xs block text-body-s text-muted-foreground">
                    {product.title}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
