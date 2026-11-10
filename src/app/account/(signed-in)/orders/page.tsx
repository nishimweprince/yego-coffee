import Image from "next/image";
import Link from "next/link";
import { AccountNotConfigured } from "@/components/account/not-configured";
import { OrderHistory } from "@/components/account/order-history";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { IMAGES } from "@/content/images";
import { getOrders } from "@/lib/customer/account";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";
import { cn } from "@/lib/utils";

/**
 * Order history (plan.md §11.3, §111).
 *
 * Twenty at a time, newest first. Older orders are one link away —
 * Shopify's cursor travels in the URL, so the page stays a Server
 * Component and the back button works. A cursor is opaque and only
 * ever handed back to the API that issued it, which scopes it to this
 * customer.
 */
export default async function OrdersPage({
  searchParams,
}: PageProps<"/account/orders">) {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account/orders");

  const { after: rawAfter } = await searchParams;
  const after =
    typeof rawAfter === "string" && rawAfter.length > 0 && rawAfter.length < 512
      ? rawAfter
      : null;

  const page = await getOrders(20, after);
  if (page === null) return <AccountNotConfigured />;

  const { orders, hasNextPage, endCursor } = page;

  if (orders.length === 0 && !after) {
    return (
      <div>
        <h1 className="text-h1">Orders</h1>
        <Contour className="mt-section-sm" />
        <div className="mt-section-sm grid items-center gap-stack-lg md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-16">
          <div>
            <p className="text-body-l">No orders yet.</p>
            <p className="mt-stack-md max-w-prose text-body-m text-muted-foreground">
              When you order, it appears here with its tracking and
              receipt.
            </p>
            <Link href="/shop" className={cn(buttonVariants(), "mt-section-sm")}>
              See the coffee
            </Link>
          </div>
          <Image
            src={IMAGES.bagsWhiteAndKraft.src}
            alt={IMAGES.bagsWhiteAndKraft.alt}
            width={IMAGES.bagsWhiteAndKraft.width}
            height={IMAGES.bagsWhiteAndKraft.height}
            sizes="(min-width: 768px) 26rem, 100vw"
            className="aspect-[4/3] w-full rounded-card object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h1">Orders</h1>
      <Contour
        label={after ? "Older orders" : "Most recent first"}
        className="mt-section-sm"
      />
      <div className="mt-section-sm">
        <OrderHistory orders={orders} />
      </div>

      <nav
        aria-label="Order pages"
        className="mt-section-sm flex flex-wrap gap-stack-md"
      >
        {after ? (
          <Link
            href="/account/orders"
            className="label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to most recent
          </Link>
        ) : null}
        {hasNextPage && endCursor ? (
          <Link
            href={`/account/orders?after=${encodeURIComponent(endCursor)}`}
            className="label text-accent underline-offset-4 hover:underline"
          >
            Older orders
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
