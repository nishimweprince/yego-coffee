import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchaseForm } from "@/components/commerce/product-purchase-form";
import { ProductGallery } from "@/components/product/product-gallery";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { RelatedProducts } from "@/components/product/related-products";
import { Contour } from "@/components/ui/contour";
import { YegoLine } from "@/components/ui/yego-line";
import { getReassurances } from "@/lib/content/reassurance";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { ROAST_LABELS, roastsOf } from "@/lib/catalog/facets";
import { env } from "@/lib/env";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structured-data";
import { hasShopifyCredentials } from "@/lib/env";
import { getCollection, getProduct } from "@/lib/shopify/storefront";

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  if (!hasShopifyCredentials()) return { title: "Product" };

  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Not found" };

  return {
    // Shopify's SEO fields are empty across this catalogue (§96.4), so
    // these fall back to the product's own real title and description
    // rather than to boilerplate.
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.description.slice(0, 200) || undefined,
      url: `/products/${product.handle}`,
      images: product.featuredImage ? [product.featuredImage.url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[handle]">) {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const [coffee, reassurances] = await Promise.all([
    getCollection(COLLECTION_HANDLES.coffee),
    getReassurances(),
  ]);
  const related = (coffee?.products ?? []).filter((p) => p.handle !== handle);

  const roasts = roastsOf(product);

  const hero = product.media[0] ?? product.featuredImage;

  // The viewer gallery: the hero first, then the rest of the media,
  // deduplicated and capped — five frames are plenty to swipe through.
  const gallery = hero
    ? [
        hero,
        ...product.media.filter((image) => image.url !== hero.url).slice(0, 4),
      ]
    : [];

  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  return (
    <main className="pb-28 lg:pb-0">
      {/* §34: product and breadcrumb structured data, entirely from
          Shopify's own catalogue values. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd(product, `${base}/products/${product.handle}`),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Shop", url: `${base}/shop` },
              {
                name: product.title,
                url: `${base}/products/${product.handle}`,
              },
            ]),
          ),
        }}
      />
      <div className="mx-auto max-w-6xl px-page-x py-section-md">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/shop"
                className="label text-muted-foreground hover:text-foreground"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden className="label text-muted-foreground">
              /
            </li>
            <li>
              <span aria-current="page" className="label text-foreground">
                {product.title}
              </span>
            </li>
          </ol>
        </nav>

        {/* The gallery is the column that sticks, not the buy column.
            The other way round left the picture ending half a screen
            above the text beside it, with a column of nothing under
            it. */}
        <div className="mt-stack-lg grid items-start gap-section-sm lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <ProductGallery images={gallery} title={product.title} />
          </div>

          <div>
            <h1 className="text-h1">{product.title}</h1>

            {/* Roast is the one fact about a coffee that is not already
                a control on this page, so it sits with the name rather
                than in a specification block that repeated the size and
                grind pickers word for word. */}
            {roasts.length > 0 ? (
              <p className="mt-stack-sm label text-muted-foreground">
                {roasts.map((roast) => ROAST_LABELS[roast]).join(" · ")} roast
              </p>
            ) : null}

            <div className="mt-stack-lg">
              <ProductPurchaseForm product={product} />
            </div>

            {/* The question that stops a first order, answered beside
                the button rather than below the description where it
                had scrolled out of sight. Just the one: the device is
                the page's signature and stacking two of them spends it
                twice. Cancellation terms belong where a recurring
                charge is actually chosen — the delivery control says
                it, and the subscriptions page carries the full text. */}
            <YegoLine
              reassurance={reassurances.shipping}
              className="mt-section-sm"
            />

            {product.descriptionHtml ? (
              <>
                <Contour label="Details" className="mt-section-sm" />
                {/* Authored by the store owner in Shopify admin, not by
                    site visitors (§39). Shopify's rich-text editor
                    leaves <meta> fragments inline (§96.4); they render
                    as nothing, which is the correct outcome. */}
                <div
                  className="mt-stack-lg max-w-prose space-y-stack-md text-body-m text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />
    </main>
  );
}
