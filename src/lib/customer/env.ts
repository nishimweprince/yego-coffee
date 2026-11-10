import { z } from "zod";

/**
 * Customer Account API configuration (plan.md §30, §100.5).
 *
 * Parsed lazily, exactly as the Storefront credentials are (§94.2):
 * the whole storefront must boot, render and sell without customer
 * accounts configured, and only the `/account` routes may care.
 *
 * It never falls back to a mock. §95 is a record of what a green build
 * against stubbed responses is worth.
 */

/**
 * Shopify's customer account endpoints, all derived from the shop's
 * numeric id (§111).
 *
 * Authentication and the GraphQL API live under different paths —
 * `/authentication/{id}/oauth/*` and `/{id}/account/customer/api/*` —
 * so one base URL cannot serve both. §104 joined both onto the same
 * base, which would have failed on the first real request. Any
 * shopify.com URL that carries the id is accepted: the hosted account
 * page the admin shows (`https://shopify.com/55913808064/account`) or
 * the authentication base.
 */
export type CustomerEndpoints = {
  shopId: string;
  /** `/oauth/authorize`, `/oauth/token` and `/logout` hang off this. */
  authBase: string;
  /** Append `/{version}/graphql`. */
  apiBase: string;
  /** Shopify's own hosted account pages, where the subscription app's
   *  extension lets a customer change what this API cannot. */
  accountUrl: string;
};

export function customerEndpoints(value: string): CustomerEndpoints | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const shopId = /\/(\d{5,})(?:\/|$)/.exec(url.pathname)?.[1];
  if (!shopId) return null;

  const origin = url.origin;
  return {
    shopId,
    authBase: `${origin}/authentication/${shopId}`,
    apiBase: `${origin}/${shopId}/account/customer/api`,
    accountUrl: `${origin}/${shopId}/account`,
  };
}

const customerSchema = z.object({
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: z.string().min(1),
  /**
   * Any shopify.com customer account URL carrying the shop's numeric
   * id, e.g. https://shopify.com/55913808064/account
   */
  SHOPIFY_CUSTOMER_ACCOUNT_URL: z
    .string()
    .url()
    .transform((value, ctx) => {
      const endpoints = customerEndpoints(value);
      if (!endpoints) {
        ctx.addIssue({
          code: "custom",
          message:
            "Expected an https shopify.com URL containing the shop id, e.g. https://shopify.com/55913808064/account",
        });
        return z.NEVER;
      }
      return endpoints;
    }),
});

export type CustomerEnv = z.infer<typeof customerSchema>;

let cached: CustomerEnv | null = null;

export function hasCustomerAccountCredentials(): boolean {
  return Boolean(
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID &&
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL,
  );
}

export function getCustomerEnv(): CustomerEnv {
  if (cached) return cached;

  const result = customerSchema.safeParse({
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID:
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    SHOPIFY_CUSTOMER_ACCOUNT_URL: process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL,
  });

  if (!result.success) {
    throw new Error(
      "Customer accounts are not configured.\n" +
        result.error.issues
          .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("\n") +
        "\n\nCreate a Customer Account API app in Shopify Admin " +
        "(Settings → Customer accounts → Headless), then set " +
        "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID and " +
        "SHOPIFY_CUSTOMER_ACCOUNT_URL. The callback " +
        "<NEXT_PUBLIC_SITE_URL>/account/callback must be registered " +
        "there too. See plan.md §100.5.",
    );
  }

  cached = result.data;
  return cached;
}

/** Test seam. */
export function resetCustomerEnv(): void {
  cached = null;
}

/**
 * Shopify's hosted account page, or null when unconfigured. Needs only
 * the URL, not the client id, so a page can link to it even before
 * sign-in works.
 */
export function customerAccountPortalUrl(): string | null {
  const value = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;
  return value ? (customerEndpoints(value)?.accountUrl ?? null) : null;
}
