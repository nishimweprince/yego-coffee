import Link from "next/link";
import { ProductMedia } from "@/components/commerce/product-media";
import { HOME } from "@/content/home";
import { PriceRange } from "@/components/commerce/product-price";
import type { ProductCardModel } from "@/lib/shopify/types";

/**
 * The signature coffees — one asymmetric composition.
 *
 * Gatare (the `light-roast` handle) is the larger story coffee;
 * Medium and Dark Roast are two smaller companions. The lineup comes
 * from Shopify's `roasted-coffee` collection; this component only adds
 * the editorial descriptor, and a coffee without one still renders.
 * Prices are Shopify's.
 */
export function SignatureCoffees({
  products,
}: {
  products: ProductCardModel[];
}) {
  if (products.length === 0) return null;

  const ordered = [...products].sort((a, b) => {
    const rank = (handle: string) =>
      handle === "light-roast" ? 0 : handle === "medium-roast" ? 1 : 2;
    return rank(a.handle) - rank(b.handle);
  });
  const [featured, ...companions] = ordered;

  return (
    <section
      aria-labelledby="signature-heading"
      className="px-page-x py-section-sm"
    >
      <div className="mx-auto max-w-6xl">
        <p className="label text-accent">{HOME.signature.heading}</p>
        <h2 id="signature-heading" className="sr-only">
          {HOME.signature.heading}
        </h2>

        <div className="mt-section-sm grid gap-stack-lg lg:grid-cols-[1.2fr_1fr] lg:gap-8">
          {featured ? (
            <article key={featured.id} className="group relative">
              <Link
                href={`/products/${featured.handle}`}
                className="block overflow-hidden rounded-sm"
              >
                <ProductMedia
                  image={featured.featuredImage}
                  title={featured.title}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="bg-muted transition-transform duration-300 ease-(--ease-brand) group-hover:scale-[1.02]"
                />
              </Link>
              <h3 className="mt-stack-md text-h1">{featured.title}</h3>
              {HOME.signature.descriptors[featured.handle] ? (
                <p className="mt-stack-sm text-body-l text-muted-foreground">
                  {HOME.signature.descriptors[featured.handle]}
                </p>
              ) : null}
              <PriceRange
                min={featured.minPrice}
                max={featured.maxPrice}
                className="mt-stack-md"
              />
              <Link
                href={`/products/${featured.handle}`}
                className="link-sweep mt-stack-md inline-block label text-accent"
              >
                Explore {featured.title}
              </Link>
            </article>
          ) : null}

          <div className="grid gap-stack-lg sm:grid-cols-2 lg:grid-cols-1">
            {companions.map((product) => (
              <article key={product.id} className="group">
                <Link
                  href={`/products/${product.handle}`}
                  className="block overflow-hidden rounded-sm"
                >
                  <ProductMedia
                    image={product.featuredImage}
                    title={product.title}
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="bg-muted transition-transform duration-300 ease-(--ease-brand) group-hover:scale-[1.02]"
                  />
                </Link>
                <h3 className="mt-stack-md text-h2">{product.title}</h3>
                {HOME.signature.descriptors[product.handle] ? (
                  <p className="mt-stack-xs text-body-m text-muted-foreground">
                    {HOME.signature.descriptors[product.handle]}
                  </p>
                ) : null}
                <PriceRange
                  min={product.minPrice}
                  max={product.maxPrice}
                  className="mt-stack-sm"
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
