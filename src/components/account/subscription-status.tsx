import type { SubscriptionStatus } from "@/lib/customer/types";
import { cn } from "@/lib/utils";

/**
 * A contract's status in words (plan.md §111). Shopify's own enum,
 * humanised, never renamed into a promise ("On its way") it does not
 * make. Active is marked with the accent dot; nothing else is coloured
 * except a failure, which needs the customer's attention.
 */
const LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  STALE: "Stale",
  UNKNOWN: "Status unavailable",
};

export function SubscriptionStatusLabel({
  status,
  className,
}: {
  status: SubscriptionStatus;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-body-s font-medium",
        status === "FAILED" ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-2 rounded-pill",
          status === "ACTIVE"
            ? "bg-accent"
            : status === "FAILED"
              ? "bg-destructive"
              : "bg-border",
        )}
      />
      {LABELS[status]}
    </p>
  );
}
