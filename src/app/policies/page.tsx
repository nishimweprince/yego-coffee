import type { Metadata } from "next";
import Link from "next/link";
import { Contour } from "@/components/ui/contour";
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
        <Contour label={`${policies.length}`} className="mt-section-sm" />

        {policies.length === 0 ? (
          <p className="mt-section-sm text-body-l text-muted-foreground">
            No policies are published yet.
          </p>
        ) : (
          <ul className="mt-section-sm divide-y divide-border border-y border-border">
            {policies.map((policy) => (
              <li key={policy.handle}>
                <Link
                  href={`/policies/${policy.handle}`}
                  className="flex items-baseline justify-between gap-4 py-stack-md text-body-l transition-colors hover:text-accent"
                >
                  {policy.title}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
