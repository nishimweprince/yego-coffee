import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { subscribeToEmailMarketing } from "./admin";
import { clearAdminToken } from "./admin-token";

const TOKEN_URL = "https://yego.myshopify.com/admin/oauth/access_token";

/** GraphQL replies, queued per test. */
const fetchMock = vi.fn();
/** Token exchange replies; defaults to a fresh day-long token. */
const tokenMock = vi.fn();

function tokenReply(token = "shpat_fresh", expiresIn = 86399) {
  return Promise.resolve(
    new Response(JSON.stringify({ access_token: token, expires_in: expiresIn }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function route(url: string, init: RequestInit) {
  return url === TOKEN_URL ? tokenMock(url, init) : fetchMock(url, init);
}

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
  vi.stubEnv("SHOPIFY_ADMIN_CLIENT_ID", "client_id");
  vi.stubEnv("SHOPIFY_ADMIN_CLIENT_SECRET", "client_secret");
  tokenMock.mockImplementation(() => tokenReply());
  vi.stubGlobal("fetch", vi.fn(route));
  clearAdminToken();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
  tokenMock.mockReset();
});

describe("subscribeToEmailMarketing", () => {
  it("creates a subscribed customer on the Admin API with an exchanged token", async () => {
    fetchMock.mockReturnValueOnce(
      reply({ customerCreate: { customer: { id: "gid://1" }, userErrors: [] } }),
    );

    await expect(subscribeToEmailMarketing("a@b.co")).resolves.toBe("subscribed");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://yego.myshopify.com/admin/api/2026-07/graphql.json");
    expect((init.headers as Record<string, string>)["X-Shopify-Access-Token"]).toBe(
      "shpat_fresh",
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

  it("refuses to run without the app credentials", async () => {
    vi.stubEnv("SHOPIFY_ADMIN_CLIENT_SECRET", "");
    await expect(subscribeToEmailMarketing("a@b.co")).rejects.toThrow(
      /SHOPIFY_ADMIN_CLIENT_SECRET/,
    );
    expect(tokenMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("Admin token", () => {
  const created = () =>
    reply({ customerCreate: { customer: { id: "gid://1" }, userErrors: [] } });

  it("exchanges the client credentials with the client_credentials grant", async () => {
    fetchMock.mockReturnValueOnce(created());
    await subscribeToEmailMarketing("a@b.co");

    const [, init] = tokenMock.mock.calls[0] as [string, RequestInit];
    const body = new URLSearchParams(String(init.body));
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("client_id")).toBe("client_id");
    expect(body.get("client_secret")).toBe("client_secret");
  });

  it("reuses the token until it is close to expiring", async () => {
    fetchMock.mockReturnValueOnce(created()).mockReturnValueOnce(created());
    await subscribeToEmailMarketing("a@b.co");
    await subscribeToEmailMarketing("c@d.co");
    expect(tokenMock).toHaveBeenCalledTimes(1);
  });

  it("shares one exchange between concurrent signups", async () => {
    fetchMock.mockReturnValueOnce(created()).mockReturnValueOnce(created());
    await Promise.all([
      subscribeToEmailMarketing("a@b.co"),
      subscribeToEmailMarketing("c@d.co"),
    ]);
    expect(tokenMock).toHaveBeenCalledTimes(1);
  });

  it("renews a token that expires within five minutes", async () => {
    tokenMock
      .mockImplementationOnce(() => tokenReply("shpat_short", 60))
      .mockImplementationOnce(() => tokenReply("shpat_next"));
    fetchMock.mockReturnValueOnce(created()).mockReturnValueOnce(created());
    await subscribeToEmailMarketing("a@b.co");
    await subscribeToEmailMarketing("c@d.co");
    expect(tokenMock).toHaveBeenCalledTimes(2);
  });

  it("exchanges again and retries once when Shopify rejects the token", async () => {
    tokenMock
      .mockImplementationOnce(() => tokenReply("shpat_revoked"))
      .mockImplementationOnce(() => tokenReply("shpat_new"));
    fetchMock
      .mockReturnValueOnce(Promise.resolve(new Response("Unauthorized", { status: 401 })))
      .mockReturnValueOnce(created());

    await expect(subscribeToEmailMarketing("a@b.co")).resolves.toBe("subscribed");
    const [, retry] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect((retry.headers as Record<string, string>)["X-Shopify-Access-Token"]).toBe(
      "shpat_new",
    );
  });

  it("fails clearly when the exchange is refused", async () => {
    tokenMock.mockImplementationOnce(() =>
      Promise.resolve(new Response('{"error":"invalid_client"}', { status: 400 })),
    );
    await expect(subscribeToEmailMarketing("a@b.co")).rejects.toThrow(
      /AdminAccessToken.*400.*invalid_client/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
