import type { Metadata } from "next";
import Link from "next/link";
import { CartLine } from "@/components/commerce/cart-line";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { formatMoneyCompact } from "@/lib/formatting/money";
import { hasShopifyCredentials } from "@/lib/env";
import { getCart } from "@/lib/shopify/cart";

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

  const cart = await getCart();

  if (!cart || cart.lines.length === 0) {
    return (
      <main className="px-page-x py-section-md">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-h1">Your cart is empty</h1>
          <p className="mt-stack-md text-body-l text-muted-foreground">
            Nothing here yet.
          </p>
          <Link
            href="/shop"
            className={`${buttonVariants({ variant: "primary" })} mt-stack-lg`}
          >
            Shop coffee
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-h1">Cart</h1>
        <Contour label={`${cart.totalQuantity} items`} className="mt-stack-lg" />

        <ul className="divide-y divide-border">
          {cart.lines.map((line) => (
            <CartLine key={line.id} line={line} />
          ))}
        </ul>

        <div className="border-t border-foreground/20 pt-stack-lg">
          <div className="flex items-baseline justify-between">
            <span className="text-body-m">Subtotal</span>
            <span className="text-price font-medium">
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
      </div>
    </main>
  );
}
