import type { Money, ShopifyImage } from "@/lib/shopify/types";

/**
 * Customer view models (plan.md §29).
 *
 * The same boundary the Storefront layer has: raw API shapes stay
 * behind the mappers, so a schema correction after the first real
 * request lands in one file (§104).
 */

export type CustomerProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  displayName: string;
};

export type OrderSummary = {
  id: string;
  /** Shopify's human order number, e.g. "#1234". */
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  total: Money;
  /** Set when Shopify cancelled the order. */
  cancelledAt: string | null;
  itemCount: number;
  itemTitles: string[];
};

export type OrderLine = {
  title: string;
  variantTitle: string | null;
  quantity: number;
  image: ShopifyImage | null;
  unitPrice: Money | null;
  lineTotal: Money | null;
};

export type OrderDetail = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  /** Shopify's hosted order status page — the tracking source of truth. */
  statusPageUrl: string | null;
  cancelledAt: string | null;
  /** Shopify's OrderCancelReason, e.g. "CUSTOMER". */
  cancelReason: string | null;
  /** Null when nothing has been refunded. */
  refunded: Money | null;
  returns: Array<{ name: string; status: string }>;
  total: Money;
  subtotal: Money | null;
  shipping: Money | null;
  tax: Money | null;
  shippingAddress: string[] | null;
  tracking: Array<{ number: string | null; url: string | null; company: string | null }>;
  lines: OrderLine[];
};

export type CustomerAddress = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zoneCode: string | null;
  zip: string | null;
  territoryCode: string | null;
  phone: string | null;
  formatted: string[];
  isDefault: boolean;
};

export type SubscriptionLine = {
  id: string;
  name: string;
  variantTitle: string | null;
  quantity: number;
  price: Money | null;
  image: ShopifyImage | null;
};

/** One upcoming delivery: Shopify bills and ships it as a cycle. */
export type BillingCycle = {
  cycleIndex: number;
  /** When Shopify expects to charge for this delivery. */
  date: string;
  skipped: boolean;
};

/**
 * Shopify's contract statuses (`SubscriptionContractSubscriptionStatus`).
 * Anything else arrives as "UNKNOWN" and offers no controls.
 */
export type SubscriptionStatus =
  | "ACTIVE"
  | "PAUSED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "STALE"
  | "UNKNOWN";

export type SubscriptionContract = {
  id: string;
  status: SubscriptionStatus;
  createdAt: string;
  nextBillingDate: string | null;
  /** Generated from the delivery policy, never a plan name (§96.3). */
  cadence: string | null;
  lines: SubscriptionLine[];
  deliveryPrice: Money | null;
  /** Shopify's last attempt to charge for this subscription failed. */
  lastPaymentFailed: boolean;
  /** Billed cycles are dropped: only deliveries still ahead. */
  upcoming: BillingCycle[];
  /**
   * What Shopify will accept for this status (§111). Derived here so
   * the page never offers a button the API is bound to refuse.
   */
  can: {
    pause: boolean;
    resume: boolean;
    cancel: boolean;
    skip: boolean;
  };
};
