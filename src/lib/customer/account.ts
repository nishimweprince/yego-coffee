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
  SUBSCRIPTION_QUERY,
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

export type OrdersPage = {
  orders: OrderSummary[];
  /** Pass back as `after` for the next, older page. */
  endCursor: string | null;
  hasNextPage: boolean;
};

export async function getOrders(
  first = 20,
  after: string | null = null,
): Promise<OrdersPage | null> {
  const data = await customerRequest<Unknown>({
    operation: "CustomerOrders",
    query: ORDERS_QUERY,
    variables: { first, after },
  });
  if (!data?.customer) return null;

  const connection = ((data.customer as Unknown).orders ?? {}) as Unknown;
  const pageInfo = (connection.pageInfo ?? {}) as Unknown;
  const nodes = (connection.nodes ?? []) as unknown[];
  return {
    orders: nodes.map(mapOrderSummary),
    endCursor: typeof pageInfo.endCursor === "string" ? pageInfo.endCursor : null,
    hasNextPage: pageInfo.hasNextPage === true,
  };
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
 * Subscription contracts (§11.5, §111). Seal's plans are native
 * selling plans, so these are the customer's real contracts.
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

/**
 * One contract. Read through `customer`, so another customer's id
 * returns nothing and the page 404s (§104.4).
 */
export async function getSubscription(
  id: string,
): Promise<SubscriptionContract | null> {
  const data = await customerRequest<Unknown>({
    operation: "CustomerSubscription",
    query: SUBSCRIPTION_QUERY,
    variables: { id },
  });
  const contract = (data?.customer as Unknown | undefined)?.subscriptionContract;
  return contract ? mapSubscription(contract) : null;
}
