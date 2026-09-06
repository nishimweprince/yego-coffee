import Link from "next/link";
import { Contour } from "@/components/ui/contour";

/**
 * Shown when the Customer Account API is not configured (§100.5).
 *
 * The same reasoning as `StoreUnavailable` (§95.3): this must read as
 * "not set up", never as "you have no orders". A customer with a real
 * order history seeing an empty account page would conclude their
 * orders were lost.
 */
export function AccountNotConfigured() {
  return (
    <div>
      <h1 className="text-display-l">Accounts aren&apos;t available yet.</h1>
      <Contour className="mt-section-sm" />
      <p className="mt-section-sm max-w-prose text-body-l text-muted-foreground">
        Customer accounts are not switched on for this store yet. Your
        orders are safe. Order confirmation emails carry a link to
        everything, including managing a subscription.
      </p>
      <Link
        href="/shop"
        className="mt-section-sm inline-block label text-accent underline-offset-4 hover:underline"
      >
        Back to the shop
      </Link>
    </div>
  );
}
