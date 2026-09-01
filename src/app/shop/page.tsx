import type { Metadata } from "next";
import { ProductCard } from "@/components/commerce/product-card";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { Contour } from "@/components/ui/contour";
import { hasShopifyCredentials } from "@/lib/env";
import { getProducts } from "@/lib/shopify/storefront";

export const metadata: Metadata = {
  title: "Shop",
  description: "Rwandan coffee, roasted in Somerville, Massachusetts.",
};

export default async function ShopPage() {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const products = await getProducts();

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-display-l">Coffee</h1>
        <Contour label={`${products.length} coffees`} className="mt-stack-lg" />

        {products.length === 0 ? (
          <p className="mt-stack-lg text-body-l text-muted-foreground">
            Nothing is available right now.
          </p>
        ) : (
          /* Four coffees read better as large editorial cards than as a
             dense grid (§93.3) — presentation over filtering. */
          <div className="mt-section-sm grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 3}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
