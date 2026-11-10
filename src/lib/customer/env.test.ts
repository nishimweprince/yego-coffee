import { afterEach, describe, expect, it, vi } from "vitest";
import {
  customerAccountPortalUrl,
  customerEndpoints,
  getCustomerEnv,
  resetCustomerEnv,
} from "./env";

const EXPECTED = {
  shopId: "55913808064",
  authBase: "https://shopify.com/authentication/55913808064",
  apiBase: "https://shopify.com/55913808064/account/customer/api",
  accountUrl: "https://shopify.com/55913808064/account",
};

describe("customerEndpoints", () => {
  it.each([
    "https://shopify.com/55913808064/account",
    "https://shopify.com/55913808064/account/",
    "https://shopify.com/55913808064",
    "https://shopify.com/authentication/55913808064",
    "https://shopify.com/authentication/55913808064/",
  ])("derives every endpoint from %s", (value) => {
    expect(customerEndpoints(value)).toEqual(EXPECTED);
  });

  it("keeps authentication and the API on their own paths", () => {
    const e = customerEndpoints("https://shopify.com/55913808064/account")!;
    expect(`${e.authBase}/oauth/token`).toBe(
      "https://shopify.com/authentication/55913808064/oauth/token",
    );
    expect(`${e.apiBase}/2026-07/graphql`).toBe(
      "https://shopify.com/55913808064/account/customer/api/2026-07/graphql",
    );
  });

  it.each([
    "https://shopify.com/account",
    "http://shopify.com/55913808064/account",
    "not a url",
  ])("refuses %s", (value) => {
    expect(customerEndpoints(value)).toBeNull();
  });
});

describe("getCustomerEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetCustomerEnv();
  });

  it("parses the owners' account URL", () => {
    vi.stubEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID", "client");
    vi.stubEnv(
      "SHOPIFY_CUSTOMER_ACCOUNT_URL",
      "https://shopify.com/55913808064/account",
    );
    expect(getCustomerEnv().SHOPIFY_CUSTOMER_ACCOUNT_URL).toEqual(EXPECTED);
    expect(customerAccountPortalUrl()).toBe(EXPECTED.accountUrl);
  });

  it("explains a URL without a shop id", () => {
    vi.stubEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID", "client");
    vi.stubEnv("SHOPIFY_CUSTOMER_ACCOUNT_URL", "https://shopify.com/account");
    expect(() => getCustomerEnv()).toThrow(/shop id/);
  });
});
