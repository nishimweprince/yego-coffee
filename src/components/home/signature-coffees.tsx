import Link from "next/link";
import { ProductMedia } from "@/components/commerce/product-media";
import { Contour } from "@/components/ui/contour";
import { HOME } from "@/content/home";
import { PriceRange } from "@/components/commerce/product-price";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * §90.03 — the signature coffees, alternating image and text to keep
 * the editorial pacing §8.3 asks for rather than a uniform grid.
 *
 * The lineup comes from Shopify's `roasted-coffee` collection; this
 * component only adds §90.03's editorial descriptor, and a coffee
 * without one still renders. Prices are Shopify's (§2.1).
 *
 * §90.03 asks for a `Subscribe` primary action per coffee. There is
 * nothing to subscribe to: the real coffees carry no selling plans, and
 * the one plan in the store discounts nothing (§96.5). A Subscribe
 * button that leads to a one-time purchase at the same price would be
 * the deceptive framing §10.4 forbids, so the action is `Explore`
 * alone until §92.1's consolidation lands.
 */
export function SignatureCoffees({
  products,
}: {
  products: ProductCardModel[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <Contour label={HOME.signature.heading} />

        <div className="mt-section-sm space-y-section-md">
          {products.map((product, index) => {
            const descriptor = HOME.signature.descriptors[product.handle];
            const reversed = index % 2 === 1;

            return (
              <article
                key={product.id}
                className="grid items-center gap-stack-lg lg:grid-cols-2 lg:gap-16"
              >
                <Link
                  href={`/products/${product.handle}`}
                  className={reversed ? "lg:order-2" : undefined}
                  tabIndex={-1}
                  aria-hidden
                >
                  <ProductMedia
                    image={product.featuredImage}
                    title={product.title}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="bg-surface-elevated"
                  />
                </Link>

                <div className={reversed ? "lg:order-1" : undefined}>
                  <h3 className="text-h1">{product.title}</h3>
                  {descriptor ? (
                    <p className="mt-stack-sm text-body-l text-muted-foreground">
                      {descriptor}
                    </p>
                  ) : null}
                  <PriceRange
                    min={product.minPrice}
                    max={product.maxPrice}
                    className="mt-stack-md"
                  />
                  <Link
                    href={`/products/${product.handle}`}
                    className="mt-stack-lg inline-block label text-accent underline-offset-4 hover:underline"
                  >
                    Explore {product.title}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
