import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { subscribeToEmailMarketing } from "./admin";

const fetchMock = vi.fn();

function reply(data: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function sent(call: number) {
  const [, init] = fetchMock.mock.calls[call] as [string, RequestInit];
  return JSON.parse(String(init.body)) as {
    query: string;
    variables: Record<string, unknown>;
  };
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", "yego.myshopify.com");
  vi.stubEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION", "2026-07");
  vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "public_token");
  vi.stubEnv("SHOPIFY_ADMIN_ACCESS_TOKEN", "shpat_admin");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("subscribeToEmailMarketing", () => {
  it("creates a subscribed customer on the Admin API with the admin token", async () => {
    fetchMock.mockReturnValueOnce(
      reply({ customerCreate: { customer: { id: "gid://1" }, userErrors: [] } }),
    );

    await expect(subscribeToEmailMarketing("a@b.co")).resolves.toBe("subscribed");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://yego.myshopify.com/admin/api/2026-07/graphql.json");
    expect((init.headers as Record<string, string>)["X-Shopify-Access-Token"]).toBe(
      "shpat_admin",
    );
    expect(sent(0).variables).toEqual({
      input: {
        email: "a@b.co",
        emailMarketingConsent: {
          marketingState: "SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN",
        },
      },
    });
  });

  it("switches consent on for an existing customer", async () => {
    fetchMock
      .mockReturnValueOnce(
        reply({
          customerCreate: {
            customer: null,
            userErrors: [{ field: ["email"], message: "Email has already been taken" }],
          },
        }),
      )
      .mockReturnValueOnce(
        reply({
          customerByIdentifier: {
            id: "gid://9",
            emailMarketingConsent: { marketingState: "NOT_SUBSCRIBED" },
          },
        }),
      )
      .mockReturnValueOnce(
        reply({
          customerEmailMarketingConsentUpdate: {
            customer: { id: "gid://9" },
            userErrors: [],
          },
        }),
      );

    await expect(subscribeToEmailMarketing("a@b.co")).resolves.toBe("subscribed");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(sent(2).variables).toMatchObject({ input: { customerId: "gid://9" } });
  });

  it("does nothing more for a customer who is already subscribed", async () => {
    fetchMock
      .mockReturnValueOnce(
        reply({
          customerCreate: {
            customer: null,
            userErrors: [{ field: ["email"], message: "Email has already been taken" }],
          },
        }),
      )
      .mockReturnValueOnce(
        reply({
          customerByIdentifier: {
            id: "gid://9",
            emailMarketingConsent: { marketingState: "SUBSCRIBED" },
          },
        }),
      );

    await expect(subscribeToEmailMarketing("a@b.co")).resolves.toBe("subscribed");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws on any other user error", async () => {
    fetchMock.mockReturnValueOnce(
      reply({
        customerCreate: {
          customer: null,
          userErrors: [{ field: ["email"], message: "Email is invalid" }],
        },
      }),
    );
    await expect(subscribeToEmailMarketing("a@b.co")).rejects.toThrow(/Email is invalid/);
  });

  it("refuses to run without the admin token", async () => {
    vi.stubEnv("SHOPIFY_ADMIN_ACCESS_TOKEN", "");
    await expect(subscribeToEmailMarketing("a@b.co")).rejects.toThrow(
      /SHOPIFY_ADMIN_ACCESS_TOKEN/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
