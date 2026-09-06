import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAnalyticsEnv,
  getShopifyEnv,
  hasShopifyCredentials,
  resetShopifyEnvCache,
} from ".";

const VALID = {
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "yego.myshopify.com",
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION: "2026-07",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: "shpat_example",
};

afterEach(() => {
  vi.unstubAllEnvs();
  resetShopifyEnvCache();
});

describe("getShopifyEnv", () => {
  it("returns parsed credentials when all are present", () => {
    for (const [k, v] of Object.entries(VALID)) vi.stubEnv(k, v);
    expect(getShopifyEnv().NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN).toBe(
      "yego.myshopify.com",
    );
  });

  it("throws an actionable error when the token is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", VALID.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
    vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION", "2026-07");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "");
    expect(() => getShopifyEnv()).toThrow(/SHOPIFY_STOREFRONT_ACCESS_TOKEN/);
  });

  it("rejects the public storefront domain, which is a real deploy mistake", () => {
    vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", "yegocoffee.com");
    vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION", "2026-07");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "shpat_example");
    expect(() => getShopifyEnv()).toThrow(/myshopify\.com/);
  });

  it("rejects a malformed API version", () => {
    for (const [k, v] of Object.entries(VALID)) vi.stubEnv(k, v);
    vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION", "latest");
    expect(() => getShopifyEnv()).toThrow(/2026-07/);
  });
});

describe("hasShopifyCredentials", () => {
  it("is false when nothing is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", "");
    vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION", "");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "");
    expect(hasShopifyCredentials()).toBe(false);
  });

  it("is true once all three are set", () => {
    for (const [k, v] of Object.entries(VALID)) vi.stubEnv(k, v);
    expect(hasShopifyCredentials()).toBe(true);
  });
});

describe("getAnalyticsEnv", () => {
  // A hosting dashboard exports an unfilled variable as "", not as
  // absent. Treating that as a malformed value broke a production
  // build that had simply not configured analytics.
  it("treats an empty string as absence, not as a malformed value", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "");

    expect(getAnalyticsEnv()).toEqual({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: undefined,
      NEXT_PUBLIC_POSTHOG_KEY: undefined,
      NEXT_PUBLIC_POSTHOG_HOST: undefined,
    });
  });

  it("treats whitespace as absence too", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "   ");
    expect(getAnalyticsEnv().NEXT_PUBLIC_GA_MEASUREMENT_ID).toBeUndefined();
  });

  it("returns a valid measurement id unchanged", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-ABC1234XYZ");
    expect(getAnalyticsEnv().NEXT_PUBLIC_GA_MEASUREMENT_ID).toBe(
      "G-ABC1234XYZ",
    );
  });

  it("still reports a key that is present and malformed", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "UA-12345-1");
    expect(() => getAnalyticsEnv()).toThrow(/G-XXXXXXX/);
  });

  it("still reports a malformed PostHog host", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "us.i.posthog.com");
    expect(() => getAnalyticsEnv()).toThrow(/NEXT_PUBLIC_POSTHOG_HOST/);
  });
});
