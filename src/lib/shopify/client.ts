import "server-only";

import { getShopifyEnv } from "@/lib/env";
import { ShopifyGraphQLError, ShopifyRequestError } from "./errors";

/**
 * The single Storefront API transport (plan.md §21.1).
 *
 * Every Shopify read in the app goes through here. Components never
 * call fetch() directly, so retries, error shape, caching and logging
 * have exactly one place to live.
 */

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export type StorefrontRequest = {
  /** Named GraphQL operation (§52) — also the log/cache key. */
  operation: string;
  query: string;
  variables?: Record<string, unknown>;
  /** Next.js cache tags (§22). Omit for uncacheable reads. */
  tags?: string[];
  /** Seconds. Omit to inherit the route's default. */
  revalidate?: number | false;
};

export async function storefrontRequest<T>({
  operation,
  query,
  variables,
  tags,
  revalidate,
}: StorefrontRequest): Promise<T> {
  const env = getShopifyEnv();

  const endpoint = `https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/${env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: {
      ...(tags ? { tags } : {}),
      ...(revalidate !== undefined ? { revalidate } : {}),
    },
  });

  if (!response.ok) {
    // Body may carry Shopify's explanation; never assume it is JSON.
    const body = await response.text().catch(() => "");
    throw new ShopifyRequestError(
      operation,
      response.status,
      body.slice(0, 500) || response.statusText,
    );
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  // Shopify returns 200 with an errors array for GraphQL-level failures.
  if (payload.errors?.length) {
    throw new ShopifyGraphQLError(operation, payload.errors);
  }

  if (!payload.data) {
    throw new ShopifyGraphQLError(operation, [
      { message: "Response contained no data" },
    ]);
  }

  return payload.data;
}
