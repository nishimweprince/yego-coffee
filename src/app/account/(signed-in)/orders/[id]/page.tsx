import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AccountNotConfigured } from "@/components/account/not-configured";
import { Contour } from "@/components/ui/contour";
import { formatMoney } from "@/lib/formatting/money";
import { getOrder } from "@/lib/customer/account";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";

/**
 * Order detail (plan.md §11.4).
 *
 * The order id comes from the URL and goes straight to the Customer
 * Account API, which scopes every response to the authenticated
 * customer. Another customer's id returns nothing, so this 404s rather
 * than leaking that the order exists (§11.7).
 */
export default async function OrderPage({
  params,
}: PageProps<"/account/orders/[id]">) {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;

  const { id } = await params;
  await requireCustomerSession(`/account/orders/${id}`);

  const order = await getOrder(decodeURIComponent(id));
  if (!order) notFound();

  return (
    <div>
      <nav aria-label="Breadcrumb">
        <Link
          href="/account/orders"
          className="label text-muted-foreground hover:text-foreground"
        >
          Orders
        </Link>
      </nav>

      <h1 className="mt-stack-sm text-h1">{order.name}</h1>
      <p className="mt-stack-sm text-body-m text-muted-foreground">
        {order.processedAt
          ? new Date(order.processedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null}
      </p>

      <Contour label="Items" className="mt-section-sm" />
      <ul className="mt-stack-lg divide-y divide-border border-b border-border">
        {order.lines.map((line, index) => (
          <li key={`${line.title}-${index}`} className="flex gap-stack-md py-stack-md">
            <span className="relative block h-16 w-16 shrink-0 overflow-hidden bg-surface-elevated">
              {line.image ? (
                <Image
                  src={line.image.url}
                  alt={line.image.altText ?? ""}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-m">{line.title}</p>
              {line.variantTitle ? (
                <p className="mt-0.5 text-body-s text-muted-foreground">
                  {line.variantTitle}
                </p>
              ) : null}
              <p className="mt-0.5 text-body-s text-muted-foreground">
                Qty {line.quantity}
              </p>
            </div>
            {line.lineTotal ? (
              <p className="text-price tabular-nums">
                {formatMoney(line.lineTotal)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-section-sm grid gap-section-sm sm:grid-cols-2">
        <section>
          <Contour label="Total" />
          <dl className="mt-stack-lg space-y-stack-xs text-body-m">
            {order.subtotal ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
              </div>
            ) : null}
            {order.shipping ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">{formatMoney(order.shipping)}</dd>
              </div>
            ) : null}
            {order.tax ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd className="tabular-nums">{formatMoney(order.tax)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-stack-sm text-price">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section>
          <Contour label="Delivery" />
          {order.shippingAddress ? (
            <address className="mt-stack-lg text-body-m not-italic text-muted-foreground">
              {order.shippingAddress.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : null}

          {order.tracking.length > 0 ? (
            <ul className="mt-stack-md space-y-stack-xs">
              {order.tracking.map((t, i) => (
                <li key={i} className="text-body-m">
                  {t.url ? (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      Track {t.company ? `with ${t.company}` : "this parcel"}
                      {t.number ? ` (${t.number})` : null}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      {t.company} {t.number}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {/* Shopify's own status page is the authority on where a
              parcel is; §11.6's principle of linking out rather than
              reimplementing applies to tracking too. */}
          {order.statusPageUrl ? (
            <a
              href={order.statusPageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-stack-md inline-block label text-accent underline-offset-4 hover:underline"
            >
              Full order status
            </a>
          ) : null}
        </section>
      </div>
    </div>
  );
}
