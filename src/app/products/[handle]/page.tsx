import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductMedia } from "@/components/commerce/product-media";
import { ProductPurchaseForm } from "@/components/commerce/product-purchase-form";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";
import { getProduct } from "@/lib/shopify/storefront";

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  if (!hasShopifyCredentials()) return { title: "Product" };

  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Not found" };

  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.description.slice(0, 160),
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

  const hero = product.media[0] ?? product.featuredImage;

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto grid max-w-6xl gap-section-sm lg:grid-cols-2 lg:gap-16">
        <div className="space-y-2">
          <ProductMedia
            image={hero}
            title={product.title}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="bg-surface-elevated"
          />
          {product.media.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.media.slice(1, 5).map((image) => (
                <ProductMedia
                  key={image.url}
                  image={image}
                  title={product.title}
                  sizes="120px"
                  className="bg-surface-elevated"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:pt-8">
          <h1 className="text-h1">{product.title}</h1>

          <div className="mt-stack-lg">
            <ProductPurchaseForm product={product} />
          </div>

          {product.descriptionHtml ? (
            <>
              <Contour label="Details" className="mt-section-sm" />
              {/* Shopify's product description is authored by the store
                  owner in the admin, not by site visitors (§39). */}
              <div
                className="mt-stack-lg space-y-stack-md text-body-m text-muted-foreground [&_a]:underline [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
