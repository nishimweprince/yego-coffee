import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchaseForm } from "@/components/commerce/product-purchase-form";
import { ProductGallery } from "@/components/product/product-gallery";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { ProductFacts } from "@/components/product/product-facts";
import { RelatedProducts } from "@/components/product/related-products";
import { SubscriptionOptions } from "@/components/product/subscription-options";
import { Contour } from "@/components/ui/contour";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
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

  const coffee = await getCollection(COLLECTION_HANDLES.coffee);
  const related = (coffee?.products ?? []).filter((p) => p.handle !== handle);

  const hero = product.media[0] ?? product.featuredImage;

  // The viewer gallery: the hero first, then the rest of the media,
  // deduplicated and capped — five frames are plenty to swipe through.
  const gallery = hero
    ? [
        hero,
        ...product.media.filter((image) => image.url !== hero.url).slice(0, 4),
      ]
    : [];

  // Every distinct subscription offered across this product's variants.
  // Which apply to the selected variant is the purchase form's job; this
  // is the product-level summary (§10.3).
  const subscriptions = Object.values(
    Object.fromEntries(
      product.variants
        .flatMap((v) => v.subscriptionOptions)
        .map((option) => [option.sellingPlanId, option]),
    ),
  );

  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  return (
    <main className="px-page-x py-section-md">
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
      <div className="mx-auto max-w-6xl">
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

        <div className="mt-stack-lg grid items-start gap-section-sm lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={gallery} title={product.title} />

          <div className="lg:sticky lg:top-24">
            <h1 className="text-h1">{product.title}</h1>

            <div className="mt-stack-lg">
              <ProductPurchaseForm product={product} />
            </div>

            {product.descriptionHtml ? (
              <>
                <Contour label="Details" className="mt-section-sm" />
                {/* Authored by the store owner in Shopify admin, not by
                    site visitors (§39). Shopify's rich-text editor
                    leaves <meta> fragments inline (§96.4); they render
                    as nothing, which is the correct outcome. */}
                <div
                  className="mt-stack-lg space-y-stack-md text-body-m text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </>
            ) : null}

            <Contour label="Specification" className="mt-section-sm" />
            <div className="mt-stack-lg">
              <ProductFacts product={product} />
            </div>

            {subscriptions.length > 0 ? (
              <>
                <Contour label="Subscription" className="mt-section-sm" />
                <div className="mt-stack-lg">
                  <SubscriptionOptions options={subscriptions} />
                  <p className="mt-stack-md text-body-s text-muted-foreground">
                    Delivered on the schedule above. Prices are the same
                    as a one-time order.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <RelatedProducts products={related} />
      </div>
    </main>
  );
}
