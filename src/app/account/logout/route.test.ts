// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Signing out (plan.md §11.1). The regression this guards: the route
 * redirected with 307, so the browser re-POSTed to Shopify's logout
 * endpoint (or to `/`, which answers 405) and the customer was never
 * signed out at Shopify.
 */

vi.mock("server-only", () => ({}));

const tokens = vi.fn();
const clear = vi.fn();

vi.mock("@/lib/customer/session", () => ({
  readTokens: () => tokens(),
  clearSession: () => clear(),
}));
vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_SITE_URL: "https://yego.example" },
}));
vi.mock("@/lib/customer/env", () => ({
  hasCustomerAccountCredentials: () => true,
  getCustomerEnv: () => ({
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: "client",
    SHOPIFY_CUSTOMER_ACCOUNT_URL: {
      shopId: "1",
      authBase: "https://shopify.com/authentication/1",
      apiBase: "https://shopify.com/1/account/customer/api",
      accountUrl: "https://shopify.com/1/account",
    },
  }),
}));

const { POST } = await import("./route");

describe("POST /account/logout", () => {
  beforeEach(() => {
    tokens.mockReset();
    clear.mockReset();
  });

  it("ends Shopify's session with a GET-following 303", async () => {
    tokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
      idToken: "id-token",
      expiresAt: 0,
    });

    const response = await POST();
    expect(response.status).toBe(303);
    expect(clear).toHaveBeenCalledOnce();

    const location = new URL(response.headers.get("location")!);
    expect(location.origin + location.pathname).toBe(
      "https://shopify.com/authentication/1/logout",
    );
    expect(location.searchParams.get("id_token_hint")).toBe("id-token");
    // Matched exactly against the Logout URI registered in Shopify.
    expect(location.searchParams.get("post_logout_redirect_uri")).toBe(
      "https://yego.example/",
    );
  });

  it("goes home with a 303 when there is no Shopify session to end", async () => {
    tokens.mockResolvedValue(null);

    const response = await POST();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://yego.example/");
    expect(clear).toHaveBeenCalledOnce();
  });
});
