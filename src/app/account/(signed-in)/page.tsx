import Link from "next/link";
import { AccountNotConfigured } from "@/components/account/not-configured";
import { Contour } from "@/components/ui/contour";
import { formatMoney } from "@/lib/formatting/money";
import { getCustomerOverview, getSubscriptions } from "@/lib/customer/account";
import { formatLongDate } from "@/lib/customer/format";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";

/**
 * Account overview (plan.md §11.2, §111).
 *
 * §11.2's dashboard leads with the next delivery: the soonest
 * delivery, still ahead and not skipped, across the customer's active
 * subscriptions — Shopify's date, never an estimate of ours.
 */
export default async function AccountPage() {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account");

  const [overview, contracts] = await Promise.all([
    getCustomerOverview(),
    getSubscriptions(),
  ]);
  if (!overview) return <AccountNotConfigured />;

  const { profile, recentOrders } = overview;
  const [latest] = recentOrders;

  const next = (contracts ?? [])
    .filter((c) => c.status === "ACTIVE")
    .flatMap((c) =>
      c.upcoming
        .filter((cycle) => !cycle.skipped)
        .slice(0, 1)
        .map((cycle) => ({ contract: c, date: cycle.date })),
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextDate = next ? formatLongDate(next.date) : null;
  const hasSubscriptions = (contracts ?? []).length > 0;

  return (
    <div>
      <h1 className="text-display-l">Welcome back, {profile.displayName}.</h1>

      <div className="mt-section-md grid gap-section-sm sm:grid-cols-2 lg:grid-cols-3">
        <section>
          <Contour label="Next delivery" />
          {next && nextDate ? (
            <div className="mt-stack-lg">
              <p className="text-h4">{nextDate}</p>
              <p className="mt-stack-xs text-body-m text-muted-foreground">
                {next.contract.lines.map((l) => l.name).join(", ")}
                {next.contract.cadence ? ` · ${next.contract.cadence}` : ""}
              </p>
              <Link
                href={`/account/subscriptions/${encodeURIComponent(next.contract.id)}`}
                className="mt-stack-md inline-block label text-accent underline-offset-4 hover:underline"
              >
                Skip, pause or change
              </Link>
            </div>
          ) : (
            <p className="mt-stack-lg text-body-m text-muted-foreground">
              {hasSubscriptions
                ? "Nothing scheduled right now."
                : "No subscription yet."}{" "}
              <Link
                href={hasSubscriptions ? "/account/subscriptions" : "/subscriptions"}
                className="text-accent underline-offset-4 hover:underline"
              >
                {hasSubscriptions ? "Your subscriptions" : "See the subscriptions"}
              </Link>
            </p>
          )}
        </section>

        <section>
          <Contour label="Recent order" />
          {latest ? (
            <div className="mt-stack-lg">
              <p className="text-h4">{latest.name}</p>
              <p className="mt-stack-xs text-body-m text-muted-foreground">
                {formatLongDate(latest.processedAt) ?? ""} ·{" "}
                {formatMoney(latest.total)}
              </p>
              <Link
                href={`/account/orders/${encodeURIComponent(latest.id)}`}
                className="mt-stack-md inline-block label text-accent underline-offset-4 hover:underline"
              >
                View order
              </Link>
            </div>
          ) : (
            <p className="mt-stack-lg text-body-m text-muted-foreground">
              No orders yet.{" "}
              <Link href="/shop" className="text-accent underline-offset-4 hover:underline">
                See the coffee
              </Link>
            </p>
          )}
        </section>

        <section>
          <Contour label="Your details" />
          <div className="mt-stack-lg space-y-stack-xs text-body-m">
            {profile.email ? <p>{profile.email}</p> : null}
            {profile.phone ? (
              <p className="text-muted-foreground">{profile.phone}</p>
            ) : null}
          </div>
          <Link
            href="/account/profile"
            className="mt-stack-md inline-block label text-accent underline-offset-4 hover:underline"
          >
            Edit profile
          </Link>
        </section>
      </div>
    </div>
  );
}
