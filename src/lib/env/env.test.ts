import { afterEach, describe, expect, it, vi } from "vitest";
import { getShopifyEnv, hasShopifyCredentials, resetShopifyEnvCache } from ".";

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
