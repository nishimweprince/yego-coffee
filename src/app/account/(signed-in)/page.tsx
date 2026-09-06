import Link from "next/link";
import { AccountNotConfigured } from "@/components/account/not-configured";
import { Contour } from "@/components/ui/contour";
import { formatMoney } from "@/lib/formatting/money";
import { getCustomerOverview } from "@/lib/customer/account";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";

/**
 * Account overview (plan.md §11.2).
 *
 * §11.2's dashboard leads with the next delivery. That line is not
 * shown here, because this store's subscriptions are not native
 * contracts (§92.1) and there is no next-billing date to read. Saying
 * nothing is better than inventing a date a customer would plan
 * around; the subscriptions page explains where to find it.
 */
export default async function AccountPage() {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account");

  const overview = await getCustomerOverview();
  if (!overview) return <AccountNotConfigured />;

  const { profile, recentOrders } = overview;
  const [latest] = recentOrders;

  return (
    <div>
      <h1 className="text-display-l">Welcome back, {profile.displayName}.</h1>

      <div className="mt-section-md grid gap-section-sm sm:grid-cols-2">
        <section>
          <Contour label="Recent order" />
          {latest ? (
            <div className="mt-stack-lg">
              <p className="text-h3">{latest.name}</p>
              <p className="mt-stack-xs text-body-m text-muted-foreground">
                {new Date(latest.processedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {formatMoney(latest.total)}
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
