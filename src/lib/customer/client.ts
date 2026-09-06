import "server-only";

import { getCustomerEnv } from "./env";
import { refreshTokens, CustomerAuthError } from "./auth";
import { readTokens, saveTokens } from "./session";

/**
 * The authenticated Customer Account API transport (plan.md §11.1,
 * §21.1, §63).
 *
 * Everything authenticated goes through here, so token refresh,
 * error shape and the "never cache customer data" rule each live in
 * one place.
 *
 * §63: customer data is private and must never enter a shared cache.
 * Every request is `no-store`. There is no tag, no revalidate, and no
 * circumstance in which one belongs here.
 *
 * ## Unverified
 * No request has ever been made (§103.2). The endpoint shape and the
 * error envelope are from Shopify's documentation.
 */

const API_VERSION = "2026-07";

export class CustomerApiError extends Error {
  constructor(
    readonly operation: string,
    readonly errors: Array<{ message: string }>,
  ) {
    super(`${operation}: ${errors.map((e) => e.message).join("; ")}`);
    this.name = "CustomerApiError";
  }
}

/**
 * A valid access token, refreshing it if it has expired.
 *
 * Returns null when there is no session at all, which callers must
 * treat as "not signed in" rather than as an error — an expired
 * session is an ordinary state, not a failure.
 */
async function currentAccessToken(): Promise<string | null> {
  const tokens = await readTokens();
  if (!tokens) return null;

  const stillValid = tokens.accessToken && tokens.expiresAt > Date.now();
  if (stillValid) return tokens.accessToken;

  try {
    const refreshed = await refreshTokens(tokens.refreshToken);
    await saveTokens(refreshed);
    return refreshed.accessToken;
  } catch {
    // A refresh token Shopify no longer honours means the session is
    // over. The caller sends them to sign in again.
    return null;
  }
}

export async function customerRequest<T>({
  operation,
  query,
  variables,
}: {
  operation: string;
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T | null> {
  const accessToken = await currentAccessToken();
  if (!accessToken) return null;

  const { SHOPIFY_CUSTOMER_ACCOUNT_URL } = getCustomerEnv();
  const endpoint = `${SHOPIFY_CUSTOMER_ACCOUNT_URL}/account/customer/api/${API_VERSION}/graphql`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (response.status === 401) {
    // The token was rejected despite looking valid. Treat it as signed
    // out rather than retrying into a loop.
    return null;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(`Customer API ${operation} failed`, response.status, body.slice(0, 300));
    throw new CustomerApiError(operation, [
      { message: `HTTP ${response.status}` },
    ]);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new CustomerApiError(operation, payload.errors);
  }

  return payload.data ?? null;
}

export { CustomerAuthError };
