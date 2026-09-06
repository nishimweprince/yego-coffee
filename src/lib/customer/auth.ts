import "server-only";

import { env } from "@/lib/env";
import { getCustomerEnv } from "./env";
import type { CustomerTokens } from "./session";

/**
 * The OAuth 2.0 authorization-code flow with PKCE, against Shopify's
 * Customer Account API (plan.md §11.1).
 *
 * ## Unverified
 *
 * Every URL, parameter name and response field below comes from
 * Shopify's documentation. **No request has been made** — §103.2
 * records the decision to build without credentials. The shapes are
 * therefore assumptions, and they are isolated here and in
 * `client.ts` so that the first run with real credentials has one
 * place to correct. §104 lists what to check first.
 */

const SCOPES = "openid email customer-account-api:full";

export function callbackUrl(): string {
  return `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/account/callback`;
}

export function authorizationUrl({
  state,
  nonce,
  codeChallenge,
}: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const { SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID, SHOPIFY_CUSTOMER_ACCOUNT_URL } =
    getCustomerEnv();

  const url = new URL(`${SHOPIFY_CUSTOMER_ACCOUNT_URL}/oauth/authorize`);
  url.searchParams.set("client_id", SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", callbackUrl());
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export class CustomerAuthError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "CustomerAuthError";
  }
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

async function requestTokens(body: URLSearchParams): Promise<CustomerTokens> {
  const { SHOPIFY_CUSTOMER_ACCOUNT_URL } = getCustomerEnv();

  const response = await fetch(`${SHOPIFY_CUSTOMER_ACCOUNT_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    // Never cached: these are single-use credentials.
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | TokenResponse
    | null;

  if (!response.ok || !payload?.access_token) {
    // Shopify's description can name the client and the redirect URI;
    // it is logged, never shown (§39).
    console.error("Customer token exchange failed", {
      status: response.status,
      error: payload?.error,
      description: payload?.error_description,
    });
    throw new CustomerAuthError(
      "Could not complete sign-in.",
      response.status,
    );
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    idToken: payload.id_token ?? null,
    // A small safety margin, so a token is refreshed slightly before
    // it expires rather than one request after.
    expiresAt: Date.now() + Math.max(0, payload.expires_in - 60) * 1000,
  };
}

export async function exchangeCodeForTokens({
  code,
  codeVerifier,
}: {
  code: string;
  codeVerifier: string;
}): Promise<CustomerTokens> {
  const { SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID } = getCustomerEnv();

  return requestTokens(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
      redirect_uri: callbackUrl(),
      code,
      code_verifier: codeVerifier,
    }),
  );
}

export async function refreshTokens(
  refreshToken: string,
): Promise<CustomerTokens> {
  const { SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID } = getCustomerEnv();

  return requestTokens(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  );
}

/**
 * Shopify's own logout, which ends the session on their side too.
 * Clearing our cookies alone would leave the customer signed in at
 * Shopify and silently signed back in on the next login attempt —
 * which is not what anyone means by "log out" (§11.1).
 */
export function logoutUrl(idToken: string | null): string {
  const { SHOPIFY_CUSTOMER_ACCOUNT_URL } = getCustomerEnv();
  const url = new URL(`${SHOPIFY_CUSTOMER_ACCOUNT_URL}/logout`);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set(
    "post_logout_redirect_uri",
    env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
  );
  return url.toString();
}
