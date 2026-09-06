import type { Metadata } from "next";
import Link from "next/link";
import { CartLine } from "@/components/commerce/cart-line";
import { ProductGrid } from "@/components/commerce/product-grid";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { YegoLine } from "@/components/ui/yego-line";
import { COLLECTION_HANDLES } from "@/lib/catalog/collections";
import { getReassurances } from "@/lib/content/reassurance";
import { formatMoneyCompact } from "@/lib/formatting/money";
import { hasShopifyCredentials } from "@/lib/env";
import { getCart } from "@/lib/shopify/cart";
import { getCollection } from "@/lib/shopify/storefront";

export const metadata: Metadata = { title: "Cart" };

// Carts are per-visitor and must never be shared-cached (§22).
export const dynamic = "force-dynamic";

export default async function CartPage() {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const [cart, reassurances] = await Promise.all([
    getCart(),
    getReassurances(),
  ]);

  if (!cart || cart.lines.length === 0) {
    // An empty cart used to be a heading, the words "Nothing here
    // yet." and one button on an otherwise blank page. It is the best
    // merchandising space on the site: the visitor is on the buying
    // path with nothing to buy. So it shows the lineup — the whole
    // catalogue is four coffees — and the two real ways in.
    const coffee = await getCollection(COLLECTION_HANDLES.coffee);
    const lineup = coffee?.products ?? [];

    return (
      <main>
        <section className="px-page-x py-section-md">
          <div className="mx-auto max-w-6xl">
            <h1 className="type-display text-display-l">Your cart is empty</h1>
            <p className="mt-stack-md max-w-prose text-lede text-muted-foreground">
              Pick a roast below, or answer three questions and we will
              match you to one.
            </p>
            <div className="mt-section-sm flex flex-wrap items-center gap-stack-md">
              <Link href="/quiz" className={buttonVariants({ size: "lg" })}>
                Find my coffee
              </Link>
              <Link
                href="/subscriptions"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Start a subscription
              </Link>
            </div>
          </div>
        </section>

        {lineup.length > 0 ? (
          <section
            aria-label="The lineup"
            data-surface="wash"
            className="px-page-x py-section-md"
          >
            <div className="mx-auto max-w-6xl">
              <Contour label="The lineup" />
              <ProductGrid
                products={lineup}
                priorityCount={2}
                className="mt-section-sm"
              />
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-4xl">
        <h1 className="type-display text-display-l">Cart</h1>
        <Contour
          label={`${cart.totalQuantity} ${cart.totalQuantity === 1 ? "item" : "items"}`}
          className="mt-section-sm"
        />

        <ul className="divide-y divide-border">
          {cart.lines.map((line) => (
            <CartLine key={line.id} line={line} />
          ))}
        </ul>

        <div className="border-t border-foreground/20 pt-stack-lg">
          <div className="flex items-baseline justify-between">
            <span className="text-body-m">Subtotal</span>
            <span className="type-figure text-price">
              {formatMoneyCompact(cart.subtotal)}
            </span>
          </div>

          {/* Never present tax or shipping as final before checkout (§15.2). */}
          <p className="mt-stack-sm text-body-s text-muted-foreground">
            Shipping and tax are calculated at checkout.
          </p>

          <a
            href={cart.checkoutUrl}
            className={`${buttonVariants({ variant: "primary", size: "lg" })} mt-stack-lg w-full`}
          >
            Checkout
          </a>
        </div>

        {/* The threshold belongs here more than anywhere: this is the
            screen where someone decides whether to add one more bag. */}
        <YegoLine
          reassurance={reassurances.shipping}
          className="mt-section-md"
        />
      </div>
    </main>
  );
}
