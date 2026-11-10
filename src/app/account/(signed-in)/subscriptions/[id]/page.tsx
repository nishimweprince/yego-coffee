import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountNotConfigured } from "@/components/account/not-configured";
import { SubscriptionControls } from "@/components/account/subscription-controls";
import { SubscriptionStatusLabel } from "@/components/account/subscription-status";
import { Contour } from "@/components/ui/contour";
import { photoForLine } from "@/lib/catalog/product-photos";
import { formatMoney } from "@/lib/formatting/money";
import { getSubscription } from "@/lib/customer/account";
import { customerAccountPortalUrl, hasCustomerAccountCredentials } from "@/lib/customer/env";
import { formatLongDate } from "@/lib/customer/format";
import { requireCustomerSession } from "@/lib/customer/guard";
import { SubscriptionContractIdSchema } from "@/lib/customer/validation";

/**
 * One subscription and what the customer can do with it (plan.md
 * §11.6, §111).
 *
 * The id comes from the URL and is read through `customer`, which the
 * Customer Account API scopes to the signed-in customer. Another
 * customer's id returns nothing, so this 404s rather than confirming
 * that the contract exists (§104.4). An id that is not a contract gid
 * is refused before any request is made.
 *
 * Prices, dates and statuses are Shopify's, shown as returned.
 */
export default async function SubscriptionPage({
  params,
}: PageProps<"/account/subscriptions/[id]">) {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;

  const { id: raw } = await params;
  await requireCustomerSession(`/account/subscriptions/${raw}`);

  const id = SubscriptionContractIdSchema.safeParse(decodeURIComponent(raw));
  if (!id.success) notFound();

  const contract = await getSubscription(id.data);
  if (!contract) notFound();

  const [lead] = contract.lines;
  const photo = lead ? photoForLine(lead.name, lead.image) : null;
  const next = formatLongDate(contract.nextBillingDate);
  const started = formatLongDate(contract.createdAt);
  const portal = customerAccountPortalUrl();
  const title = lead?.name ?? "Subscription";

  return (
    <div>
      <nav aria-label="Breadcrumb">
        <Link
          href="/account/subscriptions"
          className="label text-muted-foreground hover:text-foreground"
        >
          Subscriptions
        </Link>
      </nav>

      <div className="mt-stack-md grid gap-section-sm md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
        <div className="relative aspect-[3/4] w-full max-w-80 overflow-hidden rounded-tile bg-surface-elevated">
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.altText ?? title}
              fill
              priority
              sizes="(min-width: 768px) 20rem, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <SubscriptionStatusLabel status={contract.status} />
          <h1 className="mt-stack-sm text-h1">{title}</h1>
          {contract.cadence ? (
            <p className="mt-stack-xs text-body-l text-muted-foreground">
              {contract.cadence}
            </p>
          ) : null}

          {contract.lastPaymentFailed ? (
            <div
              role="alert"
              className="mt-stack-lg rounded-tile border border-destructive p-stack-md text-body-m"
            >
              The last payment for this subscription didn&apos;t go
              through, so the delivery wasn&apos;t sent.
              {portal ? (
                <>
                  {" "}
                  <a
                    href={portal}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    Update your payment method
                  </a>{" "}
                  and it will try again.
                </>
              ) : (
                " Email us and we'll help."
              )}
            </div>
          ) : null}

          <dl className="mt-stack-lg grid gap-stack-sm text-body-m sm:grid-cols-2">
            {contract.status === "ACTIVE" && next ? (
              <div>
                <dt className="text-body-s text-muted-foreground">Next charge</dt>
                <dd>{next}</dd>
              </div>
            ) : null}
            {started ? (
              <div>
                <dt className="text-body-s text-muted-foreground">Started</dt>
                <dd>{started}</dd>
              </div>
            ) : null}
          </dl>

          <Contour label="In each delivery" className="mt-section-sm" />
          <ul className="mt-stack-lg divide-y divide-border border-b border-border">
            {contract.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-stack-md py-stack-sm">
                <span className="text-body-m">
                  {line.quantity} × {line.name}
                  {line.variantTitle ? (
                    <span className="block text-body-s text-muted-foreground">
                      {line.variantTitle}
                    </span>
                  ) : null}
                </span>
                {line.price ? (
                  <span className="text-price tabular-nums">
                    {formatMoney(line.price)}
                  </span>
                ) : null}
              </li>
            ))}
            {contract.deliveryPrice ? (
              <li className="flex justify-between gap-stack-md py-stack-sm text-body-m">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">
                  {Number.parseFloat(contract.deliveryPrice.amount) === 0
                    ? "Free"
                    : formatMoney(contract.deliveryPrice)}
                </span>
              </li>
            ) : null}
          </ul>

          <div className="mt-section-sm">
            <SubscriptionControls contract={contract} />
          </div>

          {portal && contract.status !== "CANCELLED" && contract.status !== "EXPIRED" ? (
            <p className="mt-section-sm max-w-prose text-body-s text-muted-foreground">
              To change the coffee, how often it comes, or where it is
              delivered, use{" "}
              <a
                href={portal}
                className="text-accent underline-offset-4 hover:underline"
              >
                your Shopify account
              </a>
              .
            </p>
          ) : null}

          <p className="mt-stack-md max-w-prose text-body-s text-muted-foreground">
            Questions about this subscription?{" "}
            <a
              href={`mailto:francois@yegocoffee.com?subject=${encodeURIComponent(`My ${title} subscription`)}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              Email the roasters
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
