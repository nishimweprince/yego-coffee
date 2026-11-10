import Image from "next/image";
import Link from "next/link";
import { AccountNotConfigured } from "@/components/account/not-configured";
import { SubscriptionStatusLabel } from "@/components/account/subscription-status";
import { buttonVariants } from "@/components/ui/button";
import { Contour } from "@/components/ui/contour";
import { IMAGES } from "@/content/images";
import { photoForLine } from "@/lib/catalog/product-photos";
import { formatMoney } from "@/lib/formatting/money";
import { getSubscriptions } from "@/lib/customer/account";
import { customerAccountPortalUrl, hasCustomerAccountCredentials } from "@/lib/customer/env";
import { formatLongDate } from "@/lib/customer/format";
import { requireCustomerSession } from "@/lib/customer/guard";
import type { SubscriptionContract } from "@/lib/customer/types";
import { cn } from "@/lib/utils";

/**
 * Subscriptions (plan.md §11.5, §11.6, §111).
 *
 * Seal Subscriptions sells through native Shopify selling plans, so a
 * customer's subscription is a native contract that the Customer
 * Account API reads and changes. This page lists them; each one's own
 * page holds the controls (pause, resume, skip, cancel).
 *
 * What the API cannot change — the coffee, the frequency, the address
 * on a contract — stays with Shopify's hosted account, where the
 * subscription app's own screens live. The page links there rather
 * than reimplementing it (§11.6).
 */

const ORDER: Record<SubscriptionContract["status"], number> = {
  ACTIVE: 0,
  FAILED: 1,
  PAUSED: 2,
  STALE: 3,
  UNKNOWN: 4,
  CANCELLED: 5,
  EXPIRED: 6,
};

export default async function SubscriptionsPage() {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account/subscriptions");

  const contracts = await getSubscriptions();
  if (contracts === null) return <AccountNotConfigured />;

  const sorted = [...contracts].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const active = contracts.filter((c) => c.status === "ACTIVE").length;
  const portal = customerAccountPortalUrl();

  return (
    <div>
      <h1 className="text-h1">Subscriptions</h1>

      {contracts.length === 0 ? (
        <>
          <Contour className="mt-section-sm" />
          <div className="mt-section-sm grid items-center gap-stack-lg md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-16">
            <div>
              <p className="max-w-prose text-body-l">
                You don&apos;t have a coffee subscription yet.
              </p>
              <p className="mt-stack-md max-w-prose text-body-m text-muted-foreground">
                Choose one coffee to arrive on a schedule, or let the
                roasters choose for you. Once you subscribe, you can pause,
                skip a delivery or cancel from here.
              </p>
              <p className="mt-stack-md max-w-prose text-body-s text-muted-foreground">
                Subscribed with a different email? Sign in with that one,
                or{" "}
                <a
                  href="mailto:francois@yegocoffee.com"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  email us
                </a>{" "}
                and we&apos;ll sort it out.
              </p>
              <Link
                href="/subscriptions"
                className={cn(buttonVariants(), "mt-section-sm")}
              >
                See the subscriptions
              </Link>
            </div>
            <Image
              src={IMAGES.bagsThreeRoasts.src}
              alt={IMAGES.bagsThreeRoasts.alt}
              width={IMAGES.bagsThreeRoasts.width}
              height={IMAGES.bagsThreeRoasts.height}
              sizes="(min-width: 768px) 26rem, 100vw"
              className="aspect-[4/3] w-full rounded-card object-cover"
            />
          </div>
        </>
      ) : (
        <>
          <Contour label={`${active} active`} className="mt-section-sm" />
          <ul className="mt-section-sm grid gap-stack-lg md:grid-cols-2">
            {sorted.map((contract) => (
              <li key={contract.id}>
                <SubscriptionCard contract={contract} />
              </li>
            ))}
          </ul>

          {portal ? (
            <p className="mt-section-sm max-w-prose text-body-s text-muted-foreground">
              To change the coffee, how often it comes, or the delivery
              address, use{" "}
              <a
                href={portal}
                className="text-accent underline-offset-4 hover:underline"
              >
                your Shopify account
              </a>
              . The subscription&apos;s own settings are there.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function SubscriptionCard({ contract }: { contract: SubscriptionContract }) {
  const [lead] = contract.lines;
  const photo = lead ? photoForLine(lead.name, lead.image) : null;
  const next = formatLongDate(contract.nextBillingDate);
  const nextSkipped = contract.upcoming[0]?.skipped ?? false;
  const href = `/account/subscriptions/${encodeURIComponent(contract.id)}`;
  const live = contract.status === "ACTIVE";

  return (
    <article className="flex h-full gap-stack-md rounded-tile border border-border p-stack-md sm:p-stack-lg">
      <span className="relative block aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-tile bg-surface-elevated sm:w-24">
        {photo ? (
          <Image
            src={photo.url}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-baseline justify-between gap-stack-sm">
          <SubscriptionStatusLabel status={contract.status} />
          {contract.cadence ? (
            <p className="text-body-s text-muted-foreground">{contract.cadence}</p>
          ) : null}
        </div>

        <ul className="mt-stack-sm space-y-0.5">
          {contract.lines.map((line) => (
            <li key={line.id} className="text-body-m">
              {line.quantity > 1 ? `${line.quantity} × ` : ""}
              {line.name}
              {line.variantTitle ? (
                <span className="text-muted-foreground"> · {line.variantTitle}</span>
              ) : null}
            </li>
          ))}
        </ul>

        {lead?.price ? (
          <p className="mt-stack-xs text-price tabular-nums">
            {formatMoney(lead.price)}
          </p>
        ) : null}

        {live && next ? (
          <p className="mt-stack-sm text-body-s text-muted-foreground">
            {nextSkipped ? "Next delivery skipped" : `Next delivery ${next}`}
          </p>
        ) : null}
        {contract.lastPaymentFailed ? (
          <p className="mt-stack-sm text-body-s text-destructive">
            The last payment didn&apos;t go through.
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-auto inline-block self-start pt-stack-md label text-accent underline-offset-4 hover:underline"
        >
          Manage
          <span className="sr-only"> {lead?.name ?? "subscription"}</span>
        </Link>
      </div>
    </article>
  );
}
