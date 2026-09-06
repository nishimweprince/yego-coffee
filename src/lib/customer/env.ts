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

const customerSchema = z.object({
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: z.string().min(1),
  /**
   * The shop's Customer Account API base, e.g.
   * https://shopify.com/authentication/<shop-id>
   * Trailing slashes are trimmed so URL building stays predictable.
   */
  SHOPIFY_CUSTOMER_ACCOUNT_URL: z
    .string()
    .url()
    .transform((value) => value.replace(/\/$/, "")),
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
