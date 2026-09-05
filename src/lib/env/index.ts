import { z } from "zod";

/**
 * Environment contract (plan.md §30).
 *
 * Split deliberately into two schemas:
 *
 *   core    — required for the app to boot at all. Parsed at module
 *             load, so a misconfigured deploy dies immediately rather
 *             than serving a half-broken storefront.
 *
 *   shopify — required only when we actually talk to Shopify. Parsed
 *             lazily on first use so brand pages, the design system,
 *             and the test suite all run without credentials.
 *
 *   analytics — entirely optional. A missing GA4 or PostHog key must
 *             never stop the site booting: measurement is not the
 *             product, and a storefront that refuses to serve coffee
 *             because an analytics key is absent has its priorities
 *             backwards. A malformed key is still reported.
 *
 * The split is what lets Phase 1 finish before Storefront API keys
 * exist, without weakening the fail-fast guarantee where it counts.
 */

const coreSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const shopifySchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z
    .string()
    .min(1)
    .refine((v) => v.endsWith(".myshopify.com"), {
      message:
        "must be the *.myshopify.com admin domain, not the public storefront domain",
    }),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION: z
    .string()
    .regex(/^\d{4}-\d{2}$/, { message: "must look like 2026-07" }),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
});

/**
 * Analytics is opt-in by absence: every field is optional, and the
 * providers simply do not load when their key is missing (§31).
 */
const analyticsSchema = z.object({
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, { message: "must look like G-XXXXXXX" })
    .optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

export type CoreEnv = z.infer<typeof coreSchema>;
export type AnalyticsEnv = z.infer<typeof analyticsSchema>;
export type ShopifyEnv = z.infer<typeof shopifySchema>;

function format(issues: z.ZodIssue[]): string {
  return issues
    .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
}

function parseCore(): CoreEnv {
  const result = coreSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${format(result.error.issues)}`,
    );
  }
  return result.data;
}

export const env: CoreEnv = parseCore();

let shopifyEnv: ShopifyEnv | null = null;

/**
 * Throws with an actionable message when Storefront credentials are
 * absent. Never silently falls back to a mock — a green build against
 * stubbed data would defeat the purpose of the Phase 1 exit criteria.
 */
export function getShopifyEnv(): ShopifyEnv {
  if (shopifyEnv) return shopifyEnv;

  const result = shopifySchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      [
        "Shopify Storefront credentials are missing or invalid:",
        format(result.error.issues),
        "",
        "Set them in .env.local (see .env.example). The token comes from a",
        "Shopify custom app with unauthenticated_read_product_listings.",
      ].join("\n"),
    );
  }

  shopifyEnv = result.data;
  return shopifyEnv;
}

/** True when Shopify is configured. For rendering decisions only. */
export function hasShopifyCredentials(): boolean {
  return shopifySchema.safeParse(process.env).success;
}

/** Test seam. */
export function resetShopifyEnvCache(): void {
  shopifyEnv = null;
}

/**
 * Analytics configuration, or an empty object.
 *
 * Never throws on absence — only on a value that is present and
 * malformed, which is a typo worth surfacing rather than a
 * configuration choice.
 */
export function getAnalyticsEnv(): AnalyticsEnv {
  const result = analyticsSchema.safeParse({
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  if (!result.success) {
    throw new Error(
      `Invalid analytics configuration:\n${format(result.error.issues)}`,
    );
  }
  return result.data;
}
