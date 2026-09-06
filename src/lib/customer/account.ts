import "server-only";

import { customerRequest } from "./client";
import {
  mapAddress,
  mapOrderDetail,
  mapOrderSummary,
  mapProfile,
  mapSubscription,
} from "./mappers";
import {
  ADDRESSES_QUERY,
  CUSTOMER_QUERY,
  ORDERS_QUERY,
  ORDER_QUERY,
  SUBSCRIPTIONS_QUERY,
} from "./queries";
import type {
  CustomerAddress,
  CustomerProfile,
  OrderDetail,
  OrderSummary,
  SubscriptionContract,
} from "./types";

/**
 * Authenticated reads (plan.md §11).
 *
 * Every function returns null when there is no session, which callers
 * treat as "sign in", not as an error.
 *
 * **Ownership.** No function here takes a customer id. The Customer
 * Account API scopes every response to the token's own customer, so
 * "only own data" (§75's Phase 6 criterion) is enforced by Shopify
 * rather than by a filter of ours — and the way to keep that true is
 * never to accept an identifier from the client and never to ask for
 * one. The single id that is accepted, an order id, is passed straight
 * to an API that will not return another customer's order.
 */

type Unknown = Record<string, unknown>;

export async function getCustomerOverview(): Promise<{
  profile: CustomerProfile;
  recentOrders: OrderSummary[];
} | null> {
  const data = await customerRequest<Unknown>({
    operation: "CustomerOverview",
    query: CUSTOMER_QUERY,
  });
  if (!data?.customer) return null;

  const customer = data.customer as Unknown;
  const profile = mapProfile(customer);
  if (!profile) return null;

  const nodes = ((customer.orders as Unknown)?.nodes ?? []) as unknown[];
  return { profile, recentOrders: nodes.map(mapOrderSummary) };
}

export async function getOrders(first = 25): Promise<OrderSummary[] | null> {
  const data = await customerRequest<Unknown>({
    operation: "CustomerOrders",
    query: ORDERS_QUERY,
    variables: { first, after: null },
  });
  if (!data?.customer) return null;

  const nodes =
    (((data.customer as Unknown).orders as Unknown)?.nodes ?? []) as unknown[];
  return nodes.map(mapOrderSummary);
}

export async function getOrder(id: string): Promise<OrderDetail | null> {
  const data = await customerRequest<Unknown>({
    operation: "CustomerOrder",
    query: ORDER_QUERY,
    variables: { id },
  });
  return data?.order ? mapOrderDetail(data.order) : null;
}

export async function getAddresses(): Promise<CustomerAddress[] | null> {
  const data = await customerRequest<Unknown>({
    operation: "CustomerAddresses",
    query: ADDRESSES_QUERY,
  });
  if (!data?.customer) return null;

  const customer = data.customer as Unknown;
  const defaultId =
    ((customer.defaultAddress as Unknown)?.id as string | undefined) ?? null;
  const nodes = ((customer.addresses as Unknown)?.nodes ?? []) as unknown[];

  return nodes.map((node) => mapAddress(node, defaultId));
}

/**
 * Subscription contracts (§11.5).
 *
 * Expected to be empty for this store: Yego's subscriptions are run by
 * a third-party app and sold as duplicate products, not native selling
 * plans (§92.1, §96.5). An empty list is a real answer here, and the
 * page says so and hands the customer to Shopify's own portal per
 * §11.6 — it is not treated as a failure.
 */
export async function getSubscriptions(
  first = 20,
): Promise<SubscriptionContract[] | null> {
  const data = await customerRequest<Unknown>({
    operation: "CustomerSubscriptions",
    query: SUBSCRIPTIONS_QUERY,
    variables: { first },
  });
  if (!data?.customer) return null;

  const nodes =
    (((data.customer as Unknown).subscriptionContracts as Unknown)?.nodes ??
      []) as unknown[];
  return nodes.map(mapSubscription);
}
