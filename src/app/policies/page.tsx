import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { StoreUnavailable } from "@/components/commerce/store-unavailable";
import { hasShopifyCredentials } from "@/lib/env";
import { getPolicies } from "@/lib/shopify/storefront";

export const metadata: Metadata = { title: "Policies" };

/**
 * Policies (plan.md §6, §8.12).
 *
 * Shopify is the source: these are the same documents the checkout
 * links to, so the storefront cannot drift from what a customer
 * actually agrees to. Only the policies the store has written appear —
 * Yego has a shipping policy and a subscription cancellation policy;
 * privacy, refund and terms are not written yet, and an empty page
 * under a confident heading would be worse than their absence (§48).
 */
export default async function PoliciesPage() {
  if (!hasShopifyCredentials()) {
    return (
      <main className="px-page-x py-section-md">
        <StoreUnavailable detail="Storefront credentials are not configured." />
      </main>
    );
  }

  const policies = await getPolicies();

  return (
    <main className="px-page-x py-section-md">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-display-l">Policies</h1>
        <p className="label text-muted-foreground mt-section-sm">
          {`${policies.length} ${policies.length === 1 ? "document" : "documents"}`}
        </p>

        {policies.length === 0 ? (
          <p className="mt-section-sm text-body-l text-muted-foreground">
            No policies are published yet.
          </p>
        ) : (
          <ul className="mt-section-sm space-y-2">
            {policies.map((policy) => (
              <li
                key={policy.handle}
                className="rounded-md bg-surface-elevated transition-all duration-200 ease-(--ease-brand) hover:-translate-y-px"
              >
                <Link
                  href={`/policies/${policy.handle}`}
                  className="group flex items-baseline justify-between gap-4 px-stack-lg py-stack-md text-body-l transition-colors hover:text-accent"
                >
                  {policy.title}
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    aria-hidden
                    className="h-3 w-3 self-center transition-transform duration-200 ease-(--ease-brand) group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
