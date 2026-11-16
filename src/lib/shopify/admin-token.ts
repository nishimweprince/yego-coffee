import "server-only";

import { getNewsletterEnv } from "@/lib/env";
import { ShopifyRequestError } from "./errors";
import type { ApiAdminAccessToken } from "./types.api";

/**
 * The Admin API token for newsletter signups.
 *
 * The Headless channel only issues Storefront tokens, so the Admin
 * credential comes from a Dev Dashboard app installed on the store.
 * Such apps get no permanent token: the server trades the app's client
 * id and secret for one (OAuth client credentials grant), valid for
 * about a day. It is kept in memory and replaced a few minutes before
 * it lapses; concurrent signups share one exchange. Server only — the
 * secret and the token never reach the browser.
 */

/** Renew this long before Shopify's stated expiry. */
const EARLY_MS = 5 * 60 * 1000;
/** If Shopify omits `expires_in`, assume an hour rather than a day. */
const FALLBACK_TTL_S = 60 * 60;

let cached: { token: string; expiresAt: number } | null = null;
let inFlight: Promise<string> | null = null;

async function exchange(): Promise<string> {
  const env = getNewsletterEnv();
  const response = await fetch(
    `https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: env.SHOPIFY_ADMIN_CLIENT_ID,
        client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    // The body never echoes the secret, but keep the log short anyway.
    const body = await response.text().catch(() => "");
    throw new ShopifyRequestError(
      "AdminAccessToken",
      response.status,
      body.slice(0, 300) || response.statusText,
    );
  }

  const payload = (await response.json()) as Partial<ApiAdminAccessToken>;
  if (typeof payload.access_token !== "string" || !payload.access_token) {
    throw new ShopifyRequestError(
      "AdminAccessToken",
      response.status,
      "Response contained no access_token",
    );
  }

  const ttl = typeof payload.expires_in === "number" ? payload.expires_in : FALLBACK_TTL_S;
  cached = {
    token: payload.access_token,
    expiresAt: Date.now() + ttl * 1000 - EARLY_MS,
  };
  return payload.access_token;
}

/** A valid Admin token, exchanging the credentials only when needed. */
export async function getAdminToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt) return cached.token;
  inFlight ??= exchange().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Drop the cached token — after Shopify rejects it, and in tests. */
export function clearAdminToken(): void {
  cached = null;
}
