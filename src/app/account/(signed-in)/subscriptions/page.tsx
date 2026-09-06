import Link from "next/link";
import { AccountNotConfigured } from "@/components/account/not-configured";
import { Contour } from "@/components/ui/contour";
import { formatMoney } from "@/lib/formatting/money";
import { getSubscriptions } from "@/lib/customer/account";
import { hasCustomerAccountCredentials } from "@/lib/customer/env";
import { requireCustomerSession } from "@/lib/customer/guard";

/**
 * Subscriptions (plan.md §11.5, §11.6).
 *
 * ## Why this page mostly hands over
 *
 * §11.6 wants cancel, pause, resume, change frequency, change quantity
 * and skip. None of them are offered here, and that is a decision
 * rather than an omission:
 *
 * Yego's subscriptions are run by Seal Subscriptions and sold as
 * duplicate products, not native Shopify selling plans on the coffees
 * (§92.1, §96.5). Shopify's native `subscriptionContracts` therefore
 * has nothing to manage — and §11.6 is explicit that anything this API
 * does not support must link into Shopify's own customer-account flow
 * "rather than being reimplemented insecurely".
 *
 * A pause button that silently did nothing would be the worst possible
 * outcome: the customer believes their next charge is stopped, and it
 * is not. §11.7's confirmation and rollback requirements cannot be met
 * against an API that does not own the contract.
 *
 * When §92.1's consolidation lands and contracts become native, the
 * query already reads them and this page grows the controls.
 */
export default async function SubscriptionsPage() {
  if (!hasCustomerAccountCredentials()) return <AccountNotConfigured />;
  await requireCustomerSession("/account/subscriptions");

  const contracts = await getSubscriptions();
  if (contracts === null) return <AccountNotConfigured />;

  const active = contracts.filter((c) => c.status.toUpperCase() === "ACTIVE");
  const other = contracts.filter((c) => c.status.toUpperCase() !== "ACTIVE");

  return (
    <div>
      <h1 className="text-h1">Subscriptions</h1>

      {contracts.length === 0 ? (
        <>
          <Contour className="mt-section-sm" />
          <p className="mt-section-sm max-w-prose text-body-l">
            We don&apos;t have a subscription to show here.
          </p>
          <p className="mt-stack-md max-w-prose text-body-m text-muted-foreground">
            Yego&apos;s coffee subscriptions are managed through the link
            in your order confirmation email — that is where you can
            change the frequency, skip a delivery, or cancel. If you
            can&apos;t find it, email us and we&apos;ll sort it out.
          </p>
          <div className="mt-section-sm flex flex-wrap gap-stack-md">
            <a
              href="mailto:francois@yegocoffee.com"
              className="label text-accent underline-offset-4 hover:underline"
            >
              Email us
            </a>
            <Link
              href="/subscriptions"
              className="label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              See the plans
            </Link>
          </div>
        </>
      ) : (
        <>
          <Contour label={`${active.length} active`} className="mt-section-sm" />
          <ul className="mt-section-sm space-y-stack-lg">
            {[...active, ...other].map((contract) => (
              <li key={contract.id} className="border border-border p-stack-lg">
                <div className="flex flex-wrap items-baseline justify-between gap-stack-sm">
                  <p className="label text-muted-foreground">
                    {contract.status.replace(/_/g, " ")}
                  </p>
                  {contract.cadence ? (
                    <p className="label text-muted-foreground">
                      {contract.cadence}
                    </p>
                  ) : null}
                </div>

                <ul className="mt-stack-md space-y-stack-xs">
                  {contract.lines.map((line) => (
                    <li key={line.id} className="flex justify-between gap-4">
                      <span className="text-body-m">
                        {line.quantity} × {line.name}
                        {line.variantTitle ? ` — ${line.variantTitle}` : ""}
                      </span>
                      {line.price ? (
                        <span className="text-price tabular-nums">
                          {formatMoney(line.price)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>

                {contract.nextBillingDate ? (
                  <p className="mt-stack-md text-body-s text-muted-foreground">
                    Next billing:{" "}
                    {new Date(contract.nextBillingDate).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                ) : null}

                {/* §11.6: link into the supported flow rather than
                    reimplementing a mutation this API does not own. */}
                <p className="mt-stack-md text-body-s text-muted-foreground">
                  To change or cancel this subscription, use the link in
                  your order confirmation email.
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
