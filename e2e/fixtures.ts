import { test as base, expect } from "@playwright/test";

/**
 * Every flow needs credentials, because these run against the real
 * store (§40, and the lesson of §95). Without them the suite skips
 * with a reason rather than passing vacuously.
 */
export const test = base.extend({});

export function requireCredentials() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN &&
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  );
  test.skip(
    !configured,
    "Storefront credentials absent — see plan.md §95.5.",
  );
}

/** Shopify's hosted checkout, which is where §2.3 hands over. */
export const CHECKOUT_URL = /\/cart\/c\//;

export { expect };
