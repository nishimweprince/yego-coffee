/**
 * Shared display helpers for the account area (plan.md §11, §111).
 */

/** "November 10, 2026", or null for a missing or unreadable date. */
export function formatLongDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

/** "Tue, Dec 1" — for a short list of upcoming deliveries. */
export function formatShortDate(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
}

/**
 * Shopify's statuses are SCREAMING_SNAKE enums. They are shown to
 * customers, so they are humanised — but never renamed: "PARTIALLY_
 * FULFILLED" becomes "Partially fulfilled", not "On its way", which
 * would be an invented promise about where a parcel is.
 */
export function humanise(status: string | null): string {
  if (!status) return "Unknown";
  const lower = status.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * An order's state in one word. A cancelled order says so first.
 * No fulfillment yet is Shopify's own "Unfulfilled"; a fulfillment
 * Shopify reports as SUCCESS is "Fulfilled", the word its admin and
 * emails use. Anything else is humanised as returned.
 */
export function orderStatusLabel(order: {
  cancelledAt: string | null;
  fulfillmentStatus: string | null;
}): string {
  if (order.cancelledAt) return "Cancelled";
  if (!order.fulfillmentStatus) return "Unfulfilled";
  if (order.fulfillmentStatus.toUpperCase() === "SUCCESS") return "Fulfilled";
  return humanise(order.fulfillmentStatus);
}
