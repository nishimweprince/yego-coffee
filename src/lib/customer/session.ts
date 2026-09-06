import "server-only";

import { cookies, headers } from "next/headers";

/**
 * The customer session (plan.md §11.1, §39, §63).
 *
 * Tokens live in httpOnly cookies and never reach the browser's
 * JavaScript. §39 is explicit that a Customer Account token must not
 * leak client-side beyond the flows that require it, and none of this
 * storefront's flows require it — every authenticated read happens in
 * a Server Component or Server Action.
 *
 * The access token is short-lived and the refresh token is what makes
 * the session durable, so they have different lifetimes and are stored
 * separately rather than as one blob.
 */

const ACCESS_TOKEN = "yego_customer_at";
const REFRESH_TOKEN = "yego_customer_rt";
const ID_TOKEN = "yego_customer_it";
const EXPIRES_AT = "yego_customer_exp";
/** Short-lived, and only alive during the authorization round trip. */
const VERIFIER = "yego_oauth_verifier";
const STATE = "yego_oauth_state";
const NONCE = "yego_oauth_nonce";
const RETURN_TO = "yego_oauth_return_to";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const HANDSHAKE_MAX_AGE = 60 * 10;

/**
 * `Secure` follows the request's real protocol, not NODE_ENV — the
 * same bug §102.3 found in the cart cookie, where Chrome kept a Secure
 * cookie on http://localhost and WebKit silently dropped it. A session
 * that works in Chrome and fails in Safari is worse here than there.
 */
async function isSecureRequest(): Promise<boolean> {
  const headerList = await headers();
  const proto =
    headerList.get("x-forwarded-proto") ?? headerList.get("x-forwarded-protocol");
  if (proto) return proto.split(",")[0].trim() === "https";
  return process.env.NODE_ENV === "production";
}

async function baseOptions() {
  return {
    httpOnly: true,
    secure: await isSecureRequest(),
    // `lax` still sends the cookie on the top-level redirect back from
    // Shopify, which is exactly the navigation the callback depends on.
    sameSite: "lax" as const,
    path: "/",
  };
}

export type CustomerTokens = {
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
  /** Epoch milliseconds. */
  expiresAt: number;
};

export async function saveTokens(tokens: CustomerTokens): Promise<void> {
  const store = await cookies();
  const options = await baseOptions();

  // The access token's cookie expires with the token itself, so a
  // stale one is never presented as if it were usable.
  const accessMaxAge = Math.max(
    0,
    Math.floor((tokens.expiresAt - Date.now()) / 1000),
  );

  store.set(ACCESS_TOKEN, tokens.accessToken, { ...options, maxAge: accessMaxAge });
  store.set(REFRESH_TOKEN, tokens.refreshToken, {
    ...options,
    maxAge: REFRESH_MAX_AGE,
  });
  store.set(EXPIRES_AT, String(tokens.expiresAt), {
    ...options,
    maxAge: REFRESH_MAX_AGE,
  });
  if (tokens.idToken) {
    store.set(ID_TOKEN, tokens.idToken, { ...options, maxAge: REFRESH_MAX_AGE });
  }
}

export async function readTokens(): Promise<CustomerTokens | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN)?.value;
  const refreshToken = store.get(REFRESH_TOKEN)?.value;
  const expiresAt = Number(store.get(EXPIRES_AT)?.value ?? 0);

  // A refresh token alone is still a session: the access token may
  // simply have expired, and the caller can refresh it.
  if (!refreshToken) return null;

  return {
    accessToken: accessToken ?? "",
    refreshToken,
    idToken: store.get(ID_TOKEN)?.value ?? null,
    expiresAt,
  };
}

/**
 * §11.1's logout must clear local auth state. Every cookie is removed,
 * including the handshake values, so a half-finished login cannot be
 * resumed after a logout.
 */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  for (const name of [
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    ID_TOKEN,
    EXPIRES_AT,
    VERIFIER,
    STATE,
    NONCE,
    RETURN_TO,
  ]) {
    store.delete(name);
  }
}

export async function saveHandshake(values: {
  verifier: string;
  state: string;
  nonce: string;
  returnTo: string;
}): Promise<void> {
  const store = await cookies();
  const options = { ...(await baseOptions()), maxAge: HANDSHAKE_MAX_AGE };
  store.set(VERIFIER, values.verifier, options);
  store.set(STATE, values.state, options);
  store.set(NONCE, values.nonce, options);
  store.set(RETURN_TO, values.returnTo, options);
}

export async function readHandshake(): Promise<{
  verifier: string | null;
  state: string | null;
  nonce: string | null;
  returnTo: string | null;
}> {
  const store = await cookies();
  return {
    verifier: store.get(VERIFIER)?.value ?? null,
    state: store.get(STATE)?.value ?? null,
    nonce: store.get(NONCE)?.value ?? null,
    returnTo: store.get(RETURN_TO)?.value ?? null,
  };
}

/** Handshake values are single-use; a replayed code must not find them. */
export async function clearHandshake(): Promise<void> {
  const store = await cookies();
  for (const name of [VERIFIER, STATE, NONCE, RETURN_TO]) store.delete(name);
}
