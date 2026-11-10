import { formatCadence } from "@/lib/shopify/cadence";
import type {
  CustomerAddress,
  CustomerProfile,
  OrderDetail,
  OrderSummary,
  SubscriptionContract,
  SubscriptionStatus,
} from "./types";

/**
 * Raw Customer Account API → view models (plan.md §29).
 *
 * Written defensively on purpose. These shapes have never been seen in
 * a response (§103.2), so every field is read as optional and every
 * absence resolves to null rather than to a crash. When the first real
 * response disagrees, the page renders with a gap instead of a stack
 * trace — and §104's checklist says to fix the mapper, not to widen
 * the UI.
 */

type Unknown = Record<string, unknown>;

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function money(value: unknown): { amount: string; currencyCode: string } | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Unknown;
  const amount = str(v.amount);
  const currencyCode = str(v.currencyCode);
  return amount && currencyCode ? { amount, currencyCode } : null;
}

const ZERO = { amount: "0.00", currencyCode: "USD" };

/** A refund of 0.00 is no refund; showing the row would worry someone. */
function positive(value: ReturnType<typeof money>): ReturnType<typeof money> {
  return value && Number.parseFloat(value.amount) > 0 ? value : null;
}

function image(value: unknown) {
  const i = value as Unknown | null | undefined;
  const url = str(i?.url);
  return url
    ? { url, altText: str(i?.altText), width: null, height: null }
    : null;
}

export function mapProfile(raw: unknown): CustomerProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Unknown;

  const firstName = str(c.firstName);
  const lastName = str(c.lastName);
  const email = str((c.emailAddress as Unknown)?.emailAddress);

  return {
    id: str(c.id) ?? "",
    firstName,
    lastName,
    email,
    phone: str((c.phoneNumber as Unknown)?.phoneNumber),
    // §11.2 greets by first name. Falling back to the email rather
    // than to "Welcome back, null".
    displayName: firstName ?? email ?? "there",
  };
}

function fulfillmentStatus(raw: unknown): string | null {
  const nodes = ((raw as Unknown)?.nodes ?? []) as Unknown[];
  return str(nodes[0]?.status);
}

export function mapOrderSummary(raw: unknown): OrderSummary {
  const o = (raw ?? {}) as Unknown;
  const lineNodes = (((o.lineItems as Unknown)?.nodes ?? []) as Unknown[]);

  return {
    id: str(o.id) ?? "",
    name: str(o.name) ?? "—",
    processedAt: str(o.processedAt) ?? "",
    financialStatus: str(o.financialStatus),
    fulfillmentStatus: fulfillmentStatus(o.fulfillments),
    total: money(o.totalPrice) ?? ZERO,
    cancelledAt: str(o.cancelledAt),
    itemCount: lineNodes.reduce(
      (n, l) => n + (typeof l.quantity === "number" ? l.quantity : 0),
      0,
    ),
    itemTitles: lineNodes.map((l) => str(l.title) ?? "").filter(Boolean),
  };
}

export function mapOrderDetail(raw: unknown): OrderDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Unknown;

  const fulfillmentNodes = (((o.fulfillments as Unknown)?.nodes ?? []) as Unknown[]);

  return {
    id: str(o.id) ?? "",
    name: str(o.name) ?? "—",
    processedAt: str(o.processedAt) ?? "",
    financialStatus: str(o.financialStatus),
    fulfillmentStatus: str(fulfillmentNodes[0]?.status),
    statusPageUrl: str(o.statusPageUrl),
    cancelledAt: str(o.cancelledAt),
    cancelReason: str(o.cancelReason),
    refunded: positive(money(o.totalRefunded)),
    returns: (((o.returns as Unknown)?.nodes ?? []) as Unknown[])
      .map((r) => ({ name: str(r.name) ?? "", status: str(r.status) ?? "" }))
      .filter((r) => r.status !== ""),
    total: money(o.totalPrice) ?? ZERO,
    subtotal: money(o.subtotal),
    shipping: money(o.totalShipping),
    tax: money(o.totalTax),
    shippingAddress: Array.isArray((o.shippingAddress as Unknown)?.formatted)
      ? ((o.shippingAddress as Unknown).formatted as string[])
      : null,
    tracking: fulfillmentNodes.flatMap((f) => {
      const info = (f.trackingInformation ?? []) as Unknown[];
      return info.map((t) => ({
        number: str(t.number),
        url: str(t.url),
        company: str(t.company),
      }));
    }),
    lines: (((o.lineItems as Unknown)?.nodes ?? []) as Unknown[]).map((l) => ({
      title: str(l.title) ?? "",
      variantTitle: str(l.variantTitle),
      quantity: typeof l.quantity === "number" ? l.quantity : 1,
      image: image(l.image),
      unitPrice: money(l.price),
      lineTotal: money(l.totalPrice),
    })),
  };
}

export function mapAddress(raw: unknown, defaultId: string | null): CustomerAddress {
  const a = (raw ?? {}) as Unknown;
  const id = str(a.id) ?? "";

  return {
    id,
    firstName: str(a.firstName),
    lastName: str(a.lastName),
    company: str(a.company),
    address1: str(a.address1),
    address2: str(a.address2),
    city: str(a.city),
    zoneCode: str(a.zoneCode),
    zip: str(a.zip),
    territoryCode: str(a.territoryCode),
    phone: str(a.phoneNumber),
    formatted: Array.isArray(a.formatted) ? (a.formatted as string[]) : [],
    isDefault: Boolean(defaultId && id === defaultId),
  };
}

const STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  "ACTIVE",
  "PAUSED",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "STALE",
]);

function status(value: unknown): SubscriptionStatus {
  const s = str(value)?.toUpperCase();
  return s && STATUSES.has(s as SubscriptionStatus)
    ? (s as SubscriptionStatus)
    : "UNKNOWN";
}

/**
 * `intervalCount` is a `Count` object ({ count }) in this API. A bare
 * number is accepted too, so a schema that differs from the docs still
 * reads.
 */
function intervalCountOf(value: unknown): number | null {
  if (typeof value === "number") return value;
  const count = (value as Unknown | null | undefined)?.count;
  return typeof count === "number" ? count : null;
}

export function mapSubscription(raw: unknown): SubscriptionContract {
  const s = (raw ?? {}) as Unknown;
  const policy = (s.deliveryPolicy ?? {}) as Unknown;

  const interval = str(policy.interval) as
    | "DAY"
    | "WEEK"
    | "MONTH"
    | "YEAR"
    | null;
  const intervalCount = intervalCountOf(policy.intervalCount);
  const contractStatus = status(s.status);

  const upcoming = (((s.upcomingBillingCycles as Unknown)?.nodes ?? []) as Unknown[])
    .filter((c) => str(c.status) !== "BILLED")
    .flatMap((c) => {
      const date = str(c.billingAttemptExpectedDate);
      return typeof c.cycleIndex === "number" && date
        ? [{ cycleIndex: c.cycleIndex, date, skipped: c.skipped === true }]
        : [];
    });

  return {
    id: str(s.id) ?? "",
    status: contractStatus,
    createdAt: str(s.createdAt) ?? "",
    nextBillingDate: str(s.nextBillingDate),
    // The same rule as everywhere else: cadence comes from the policy
    // (§96.3). A contract that states none says nothing.
    cadence: formatCadence(interval, intervalCount),
    lines: (((s.lines as Unknown)?.nodes ?? []) as Unknown[]).map((l) => ({
      id: str(l.id) ?? "",
      name: str(l.name) ?? str(l.title) ?? "",
      variantTitle: str(l.variantTitle),
      quantity: typeof l.quantity === "number" ? l.quantity : 1,
      price: money(l.currentPrice),
      image: image(l.image),
    })),
    deliveryPrice: money(s.deliveryPrice),
    lastPaymentFailed: str(s.lastPaymentStatus) === "FAILED",
    upcoming,
    // Shopify's activate accepts active, paused or failed contracts;
    // pause and skip only make sense on one that is running.
    can: {
      pause: contractStatus === "ACTIVE",
      resume: contractStatus === "PAUSED" || contractStatus === "FAILED",
      cancel:
        contractStatus === "ACTIVE" ||
        contractStatus === "PAUSED" ||
        contractStatus === "FAILED",
      skip: contractStatus === "ACTIVE",
    },
  };
}
