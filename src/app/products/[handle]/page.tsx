import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPurchaseForm } from "@/components/commerce/product-purchase-form";
import { ProductGallery } from "@/components/product/product-gallery";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { RelatedProducts } from "@/components/product/related-products";
import { Contour } from "@/components/ui/contour";
import { PageHeader } from "@/components/ui/page-header";
import { YegoLine } from "@/components/ui/yego-line";
import { getReassurances } from "@/lib/content/reassurance";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { roastNote } from "@/lib/catalog/facets";
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
      // The JPEG rendition: several store photographs are HEIC, which
      // link-preview crawlers do not render.
      images: product.shareImageUrl ? [product.shareImageUrl] : undefined,
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

  const roast = roastNote(product);

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
      {/* The opening (§108): the gallery and the decision side by side
          on the page's own ground — no tinted band. */}
      <section className="px-page-x py-section-sm">
        <div className="mx-auto max-w-page">
          {/* The gallery is the column that sticks, not the buy column.
              The other way round left the picture ending half a screen
              above the text beside it, with a column of nothing under
              it. */}
          {/* The photo and the decision sit as one pair (§108.8): the
              photo column is exactly as wide as the photo, the details
              column is capped at 32rem, and the pair is centred with a
              single gutter — no empty column between them. */}
          <div className="grid items-start gap-stack-lg lg:grid-cols-[auto_minmax(0,42rem)] lg:justify-center lg:gap-16">
            {/* The gallery — photo and thumbnails — fits one screen
                at every size (see .pdp-gallery in globals.css). */}
            <div className="pdp-gallery mx-auto lg:sticky lg:top-30 lg:mx-0">
              <ProductGallery images={gallery} title={product.title} />
            </div>

            <div className="lg:pt-stack-sm">
              <PageHeader
                title={product.title}
                size="product"
                breadcrumb={[{ href: "/shop", label: "Shop" }]}
              />

              {/* Roast is the one fact about a coffee that is not
                  already a control on this page, so it sits with the
                  name rather than in a specification block that
                  repeated the size and grind pickers word for word. */}
              {roast ? (
                <p className="mt-4 text-lede text-muted-foreground">
                  {roast} roast
                </p>
              ) : null}

              <div className="mt-stack-md">
                <ProductPurchaseForm
                  product={product}
                  subscriptionPolicyHref={reassurances.cancellation?.href}
                />
              </div>

              {/* The question that stops a first order, answered beside
                  the button rather than below the description where it
                  had scrolled out of sight. Just the one: cancellation
                  terms belong where a recurring charge is actually
                  chosen, and the delivery line links them. */}
              <YegoLine
                reassurance={reassurances.shipping}
                className="mt-section-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {product.descriptionHtml ? (
        <section aria-label="Details" className="px-page-x pt-section-md">
          <div className="mx-auto max-w-page">
            <Contour label="Details" />
            {/* Authored by the store owner in Shopify admin, not by
                site visitors (§39). Shopify's rich-text editor leaves
                <meta> fragments inline (§96.4); they render as
                nothing, which is the correct outcome. */}
            <div
              className="mt-stack-lg max-w-prose space-y-stack-md text-body-l text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>
        </section>
      ) : null}

      <RelatedProducts products={related} />
    </main>
  );
}
